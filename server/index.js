// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin, adminConfigured } from './supabaseAdmin.js';
import { mapServerRegisterError } from './authErrors.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const memoryStore = new Map();

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    storage: 'memory',
    supabaseAdmin: adminConfigured,
  });
});

// Demo signup — creates user already confirmed (no confirmation email sent)
app.post('/api/auth/register', async (req, res) => {
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
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: mapServerRegisterError("Password must be at least 6 characters"),
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() },
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
        name: name.trim(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const userMap = memoryStore.get(userId);
    const value = userMap ? userMap.get(key) : null;
    res.json({ success: true, data: value ?? null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
    const { data } = req.body;
    if (!memoryStore.has(userId)) memoryStore.set(userId, new Map());
    memoryStore.get(userId).set(key, data);
    res.json({ success: true, message: 'Data saved', data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/data/:userId/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;
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
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
process.on('SIGINT', async () => {
  process.exit(0);
});

start();