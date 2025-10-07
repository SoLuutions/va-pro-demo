import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    storage: 'localStorage-only',
    message: 'Server running without database connections'
  });
});

// Data endpoints return localStorage-only message
app.get('/api/data/:userId/:key', async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Using localStorage-only mode. No server-side storage.',
    data: null
  });
});

app.post('/api/data/:userId/:key', async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Using localStorage-only mode. Data saved to browser storage only.'
  });
});

app.delete('/api/data/:userId/:key', async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Using localStorage-only mode. No server-side data to delete.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📦 Running in localStorage-only mode (no database connections)');
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
