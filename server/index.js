// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
  try {
    res.json({ status: 'ok', storage: 'memory' });
  } catch (e) {
    res.status(500).json({ status: 'fail', error: e.message });
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