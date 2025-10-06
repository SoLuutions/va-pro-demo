import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------- Redis (cache/sessions/temp) ----------
let redisClient;

const createRedisClient = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    // If your Redis ever requires TLS, uncomment below:
    // socket: { tls: true, rejectUnauthorized: false },
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
  redisClient.on('reconnecting', () => console.log('⏳ Redis reconnecting...'));

  await redisClient.connect();
  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis client not initialized');
  return redisClient;
};

// ---------- Postgres (primary DB) ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway’s proxy typically works without SSL params. If you ever need SSL:
  // ssl: { rejectUnauthorized: false },
});

// Test DB connectivity on startup
const assertPostgres = async () => {
  const { rows } = await pool.query('SELECT 1 as ok');
  if (!rows?.length) throw new Error('Postgres not reachable');
};

// ---------- Sessions (stored in Redis) ----------
const RedisStore = connectRedis(session);

const sessionMiddleware = session({
  name: 'sid',
  store: new RedisStore({ client: () => getRedisClient() }),
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Railway is HTTPS in prod behind proxy—set secure when you put a custom domain + HTTPS
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

app.use(sessionMiddleware);

// ---------- Routes ----------
app.get('/api/health', async (_req, res) => {
  try {
    const redisStatus = redisClient?.isOpen ? 'connected' : 'disconnected';
    await pool.query('SELECT NOW()'); // quick DB ping
    res.json({ status: 'ok', redis: redisStatus, postgres: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'fail', error: e.message });
  }
});

// Example: use Redis as a temp KV per user
app.get('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const client = getRedisClient();
    const value = await client.get(`user:${userId}:${key}`);
    res.json({ success: true, data: value ? JSON.parse(value) : null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const { data } = req.body;
    const client = getRedisClient();
    await client.set(`user:${userId}:${key}`, JSON.stringify(data));
    res.json({ success: true, message: 'Data saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const client = getRedisClient();
    await client.del(`user:${userId}:${key}`);
    res.json({ success: true, message: 'Data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Minimal Postgres examples ---
// 1) Ensure a users table exists
app.post('/api/db/migrate', async (_req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    res.json({ ok: true });
  } catch (e) {
    // If gen_random_uuid() extension missing, enable it:
    // await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
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

// ---------- Start ----------
const startServer = async () => {
  try {
    await createRedisClient();
    await assertPostgres();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
  // pg pool will drain on process exit
  process.exit(0);
});

startServer();
