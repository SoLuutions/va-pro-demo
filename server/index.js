import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let redisClient = null;
let redisConnected = false;

const createRedisClient = async () => {
  if (!process.env.REDIS_URL) {
    console.log('ℹ️  No REDIS_URL found - running without Redis backend');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      redisConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('⏳ Redis reconnecting...');
      redisConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis connection failed - running without backend storage:', error.message);
    return null;
  }
};

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    redis: redisConnected ? 'connected' : 'disconnected',
    storage: redisConnected ? 'redis' : 'localStorage-only'
  });
});

app.get('/api/data/:userId/:key', async (req, res) => {
  if (!redisClient || !redisConnected) {
    return res.status(503).json({ 
      success: false, 
      error: 'Redis not available - using localStorage only' 
    });
  }

  try {
    const { userId, key } = req.params;
    const value = await redisClient.get(`user:${userId}:${key}`);
    res.json({ success: true, data: value ? JSON.parse(value) : null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/data/:userId/:key', async (req, res) => {
  if (!redisClient || !redisConnected) {
    return res.status(503).json({ 
      success: false, 
      error: 'Redis not available - using localStorage only' 
    });
  }

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
  if (!redisClient || !redisConnected) {
    return res.status(503).json({ 
      success: false, 
      error: 'Redis not available - using localStorage only' 
    });
  }

  try {
    const { userId, key } = req.params;
    await redisClient.del(`user:${userId}:${key}`);
    res.json({ success: true, message: 'Data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const startServer = async () => {
  try {
    await createRedisClient();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      if (!redisConnected) {
        console.log('📦 Using localStorage-only mode (no backend database)');
      }
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
  process.exit(0);
});

startServer();
