import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let redisClient;

const createRedisClient = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      console.log('⏳ Redis reconnecting...');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', redis: redisClient?.isOpen ? 'connected' : 'disconnected' });
});

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

const startServer = async () => {
  try {
    await createRedisClient();

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
  process.exit(0);
});

startServer();
