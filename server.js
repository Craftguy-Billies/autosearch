import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchAndSummarize } from './lib/search-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Query parameter is required and must be a non-empty string' 
      });
    }

    console.log(`[${new Date().toISOString()}] Search request: "${query}"`);
    
    // Set timeout for the request
    const timeoutMs = 120000; // 2 minutes max
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );

    const result = await Promise.race([
      searchAndSummarize(query),
      timeoutPromise
    ]);

    console.log(`[${new Date().toISOString()}] Search completed successfully`);
    res.json(result);

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve documentation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Search API server running on port ${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}`);
  console.log(`🔍 API endpoint: http://localhost:${PORT}/api/search`);
});
