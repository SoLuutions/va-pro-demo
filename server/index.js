// server/index.js
import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// If you put a custom domain + HTTPS behind a proxy later, this helps secure cookies.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

// -------- Paths (for serving the built frontend) --------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Redis (cache/sessions/temp) ----------
let redisClient;

async function connectRedis() {
  if (redisClient?.isOpen) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL,
    // If your Redis ever requires TLS, uncomment:
    // socket: { tls: true, rejectUnauthorized: false },
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('reconnecting', () => console.log('⏳ Redis reconnecting...'));

  await redisClient.connect();
  return redisClient;
}

// ---------- Postgres (primary DB) ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If you enable SSL in your Railway PG connection, use:
  // ssl: { rejectUnauthorized: false },
});

async function assertPostgres() {
  const { rows } = await pool.query('SELECT 1 as ok');
  if (!rows?.length) throw new Error('Postgres not reachable');
}

// ---------- Routes (API) ----------
app.get('/api/health', async (_req, res) => {
  try {
    const redisStatus = redisClient?.isOpen ? 'connected' : 'disconnected';
    await pool.query('SELECT NOW()');
    res.json({ status: 'ok', redis: redisStatus, postgres: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'fail', error: e.message });
  }
});

// Example: Redis as a temp KV per user
app.get('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const value = await redisClient.get(`user:${userId}:${key}`);
    res.json({ success: true, data: value ? JSON.parse(value) : null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const { data } = req.body;
    await redisClient.set(`user:${userId}:${key}`, JSON.stringify(data));
    res.json({ success: true, message: 'Data saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    await redisClient.del(`user:${userId}:${key}`);
    res.json({ success: true, message: 'Data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post('/api/db/migrate', async (_req, res) => {
  try {    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await pool.query(`
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 2) Insert a user
app.post('/api/users', async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO users(email) VALUES($1) ON CONFLICT(email) DO UPDATE SET email = EXCLUDED.email RETURNING id, email, created_at',
      [email]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3) Get user by id
app.get('/api/users/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

async function start() {
  try {
    await assertPostgres();
    console.log('✅ Postgres connected');
    await connectRedis();
    const RedisStore = connectRedis(session);
    const store = new RedisStore({ client: redisClient });

    app.use(
      session({
        name: 'sid',
        store,
        secret: process.env.SESSION_SECRET || 'change-me',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
      })
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
process.on('SIGINT', async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
  process.exit(0);
});

start();