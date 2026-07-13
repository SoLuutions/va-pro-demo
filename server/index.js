// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin, adminConfigured } from './supabaseAdmin.js';
import { mapServerRegisterError } from './authErrors.js';
import { sanitizeInput } from '../src/utils/sanitize.js';

dotenv.config();

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PostgreSQL Pool if DATABASE_URL is available
const connectionString =
  process.env.DATABASE_URL ||
  process.env.vapro_POSTGRES_URL_NON_POOLING ||
  process.env.vapro_POSTGRES_URL;

let pool = null;
if (connectionString) {
  const cleanUrl = connectionString
    .replace(/([?&])sslmode=[^&]*&?/g, "$1")
    .replace(/[?&]$/, "");
    
  const sslNoVerify = process.env.DATABASE_SSL_NO_VERIFY === 'true';
  if (sslNoVerify) {
    console.warn('⚠️ DATABASE_SSL_NO_VERIFY=true — TLS certificate verification is disabled.');
  }

  pool = new Pool({
    connectionString: cleanUrl,
    ssl: {
      rejectUnauthorized: !sslNoVerify,
      ca: process.env.DATABASE_CA_CERT || undefined,
    },
    connectionTimeoutMillis: 10000,
  });
  console.log("🐘 PostgreSQL pool initialized successfully.");
} else {
  console.warn("⚠️ No DATABASE_URL found. Running with ephemeral in-memory storage.");
}

const memoryStore = new Map();

const MAX_DATA_BYTES = 1_000_000; // 1 MB per key

// --- Rate Limiting Middleware ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 registration requests per 15 minutes
  message: {
    success: false,
    error: 'Too many registration requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 API requests per minute
  message: {
    success: false,
    error: 'Too many data requests. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Auth Middleware for user data endpoints ---
// Verifies the Supabase access token and ensures it belongs to :userId.
// In local demo mode (no Supabase admin configured) there is no token system,
// so validation is skipped and data lives in the ephemeral memory store.
async function requireDataAuth(req, res, next) {
  if (!adminConfigured) return next();

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }
    if (data.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  } catch {
    res.status(500).json({ success: false, error: 'Authentication check failed' });
  }
}

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    storage: pool ? 'postgres' : 'memory',
    supabaseAdmin: adminConfigured,
  });
});

// Demo signup — creates user already confirmed (no confirmation email sent)
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    if (!adminConfigured) {
      return res.status(503).json({
        success: false,
        error: mapServerRegisterError("Server auth not configured"),
      });
    }

    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: mapServerRegisterError("Name, email, and password are required"),
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: mapServerRegisterError("Password must be at least 8 characters"),
      });
    }

    // Input sanitization
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).trim().toLowerCase();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: sanitizedName },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: mapServerRegisterError(error.message),
      });
    }

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: sanitizedName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/api/data/:userId/:key', apiLimiter, requireDataAuth, async (req, res) => {
  try {
    const { userId, key } = req.params;
    
    if (pool) {
      const result = await pool.query(
        'SELECT data FROM public.user_app_data WHERE user_id = $1 AND key = $2',
        [userId, key]
      );
      const value = result.rows[0]?.data;
      return res.json({ success: true, data: value ?? null });
    }
    
    const userMap = memoryStore.get(userId);
    const value = userMap ? userMap.get(key) : null;
    res.json({ success: true, data: value ?? null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/data/:userId/:key', apiLimiter, requireDataAuth, async (req, res) => {
  let dbClient = null;
  try {
    const { userId, key } = req.params;
    let { data } = req.body;

    if (Buffer.byteLength(JSON.stringify(data ?? null), 'utf8') > MAX_DATA_BYTES) {
      return res.status(413).json({ success: false, error: 'Payload too large' });
    }

    // 1. Input Sanitization
    if (key === 'va_pro_clients' && Array.isArray(data)) {
      data = data.map(client => ({
        ...client,
        name: sanitizeInput(client.name),
        email: sanitizeInput(client.email),
        phone: sanitizeInput(client.phone),
        location: sanitizeInput(client.location),
        notes: sanitizeInput(client.notes),
        projects: Array.isArray(client.projects) 
          ? client.projects.map(p => sanitizeInput(p)) 
          : [],
      }));
    } else if (key === 'va_pro_tasks' && Array.isArray(data)) {
      data = data.map(task => ({
        ...task,
        title: sanitizeInput(task.title),
        description: sanitizeInput(task.description),
        project: sanitizeInput(task.project),
        fileLinks: sanitizeInput(task.fileLinks),
        outputLinks: sanitizeInput(task.outputLinks),
      }));
    } else if (key === 'va_pro_user_profile' && data) {
      data = {
        ...data,
        name: sanitizeInput(data.name),
        email: sanitizeInput(data.email),
        timezone: sanitizeInput(data.timezone),
        avatarUrl: sanitizeInput(data.avatarUrl),
      };
    }

    if (pool) {
      dbClient = await pool.connect();
      await dbClient.query('BEGIN');
      // Serialize writes per user to close read-validate-write races
      await dbClient.query('SELECT pg_advisory_xact_lock(hashtext($1::text))', [userId]);
    }

    // Fetch existing data for validation
    let existingData = null;
    if (dbClient) {
      const resDb = await dbClient.query(
        'SELECT data FROM public.user_app_data WHERE user_id = $1 AND key = $2',
        [userId, key]
      );
      existingData = resDb.rows[0]?.data;
    } else {
      const userMap = memoryStore.get(userId);
      existingData = userMap ? userMap.get(key) : null;
    }

    // 2. Server-side Active Timer & Time Entry Validation
    if (key === 'va_pro_active_timer') {
      if (data && data.startedAt) {
        let existingTimer = null;
        if (dbClient) {
          const resTimer = await dbClient.query(
            'SELECT data FROM public.user_app_data WHERE user_id = $1 AND key = $2',
            [userId, 'va_pro_active_timer']
          );
          existingTimer = resTimer.rows[0]?.data;
        } else {
          existingTimer = memoryStore.get(userId)?.get('va_pro_active_timer');
        }

        if (!existingTimer || !existingTimer.startedAt) {
          // Timer is starting: override startedAt with server time to prevent backdating
          data.startedAt = new Date().toISOString();
          data.totalBreakTime = 0;
          console.log(`[Timer Server] Start recorded at: ${data.startedAt} for user ${userId}`);
        } else {
          // Timer is running/updating: preserve the original server-side start time
          data.startedAt = existingTimer.startedAt;
          // Validate total break time is not reduced
          const newBreak = parseInt(data.totalBreakTime) || 0;
          const oldBreak = parseInt(existingTimer.totalBreakTime) || 0;
          if (newBreak < oldBreak) {
            data.totalBreakTime = oldBreak;
          }
        }
      }
    }

    if (key === 'va_pro_time_entries' && Array.isArray(data)) {
      const existingEntries = Array.isArray(existingData) ? existingData : [];
      const existingIds = new Set(existingEntries.map(e => e.id));
      const newEntries = data.filter(e => !existingIds.has(e.id));

      if (newEntries.length > 0) {
        let activeTimer = null;
        if (dbClient) {
          const resTimer = await dbClient.query(
            'SELECT data FROM public.user_app_data WHERE user_id = $1 AND key = $2',
            [userId, 'va_pro_active_timer']
          );
          activeTimer = resTimer.rows[0]?.data;
        } else {
          activeTimer = memoryStore.get(userId)?.get('va_pro_active_timer');
        }

        for (const newEntry of newEntries) {
          if (activeTimer && activeTimer.startedAt && activeTimer.taskId === newEntry.taskId) {
            // Validate timer-based entry
            const serverNow = Date.now();
            const startedAtTime = new Date(activeTimer.startedAt).getTime();
            const breakTimeMs = (parseInt(activeTimer.totalBreakTime) || 0) * 1000;
            const actualDurationSeconds = Math.max(0, (serverNow - startedAtTime - breakTimeMs) / 1000);
            const actualDurationHours = parseFloat((actualDurationSeconds / 3600).toFixed(2));

            // Allow small buffer (e.g. 0.05 hours / 3 minutes)
            const allowedMaxHours = actualDurationHours + 0.05;
            if (newEntry.duration > allowedMaxHours) {
              console.warn(`[Timer Validation] Corrected duration for entry ${newEntry.id}: client=${newEntry.duration}h, server=${actualDurationHours}h.`);
              newEntry.duration = actualDurationHours;
              newEntry.description = `${newEntry.description} (Validated by server: corrected duration)`;
            } else {
              newEntry.description = `${newEntry.description} (Validated by server)`;
            }
            
            // Clear active timer on server since it is now logged
            if (dbClient) {
              await dbClient.query(
                'DELETE FROM public.user_app_data WHERE user_id = $1 AND key = $2',
                [userId, 'va_pro_active_timer']
              );
            } else {
              memoryStore.get(userId)?.delete('va_pro_active_timer');
            }
            activeTimer = null; // Prevent matching same active timer for multiple entries
          } else {
            // Manual entry validation
            if (newEntry.duration > 12) {
              newEntry.duration = 12;
              newEntry.description = `${newEntry.description} (Validated by server: capped at 12 hours)`;
            }
          }
          newEntry.description = sanitizeInput(newEntry.description);
        }
      }
    }

    // Save to DB or fallback memory
    if (dbClient) {
      await dbClient.query(
        `INSERT INTO public.user_app_data (user_id, key, data, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, key)
         DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [userId, key, JSON.stringify(data ?? null)]
      );
      await dbClient.query('COMMIT');
    } else {
      if (!memoryStore.has(userId)) memoryStore.set(userId, new Map());
      memoryStore.get(userId).set(key, data);
    }

    res.json({ success: true, message: 'Data saved', data });
  } catch (error) {
    if (dbClient) {
      try { await dbClient.query('ROLLBACK'); } catch {}
    }
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (dbClient) dbClient.release();
  }
});

app.delete('/api/data/:userId/:key', apiLimiter, requireDataAuth, async (req, res) => {
  try {
    const { userId, key } = req.params;
    
    if (pool) {
      await pool.query(
        'DELETE FROM public.user_app_data WHERE user_id = $1 AND key = $2',
        [userId, key]
      );
      return res.json({ success: true, message: 'Data deleted' });
    }
    
    const userMap = memoryStore.get(userId);
    if (userMap) {
      userMap.delete(key);
      if (userMap.size === 0) memoryStore.delete(userId);
    }
    res.json({ success: true, message: 'Data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

async function start() {
  try {
    // Startup check
    if (pool) {
      const client = await pool.connect();
      console.log('✅ Database connection test successful.');
      client.release();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  if (pool) {
    await pool.end();
    console.log('🐘 PostgreSQL pool closed.');
  }
  process.exit(0);
});

start();