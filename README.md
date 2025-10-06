# AI Web Search API

🔍 **Intelligent web search powered by AI** - Fast, accurate, and easy to use.

## Features

- 🤖 **AI-Powered**: Uses advanced AI (NVIDIA LLama-4) to optimize queries and extract relevant information
- ⚡ **Fast & Efficient**: Processes multiple search results with intelligent extraction
- 🎯 **Accurate**: Smart content extraction focuses only on relevant information
- 🔄 **Reliable**: Built-in retry logic and fallback mechanisms
- 🌐 **No API Keys Required**: Uses DuckDuckGo HTML search (no rate limits on API keys)

## How It Works

1. **Query Optimization**: AI analyzes your question and generates optimized search queries
2. **Web Scraping**: Fetches top results from DuckDuckGo
3. **Content Extraction**: Extracts main content using Mozilla Readability
4. **AI Summarization**: Each result is analyzed and summarized by AI
5. **Final Synthesis**: All summaries are combined into one concise answer

## Quick Start

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

The API will be available at `http://localhost:3000`

### Testing

Run the Python test suite:

```bash
python3 test_api.py
```

## API Usage

### Endpoint

```
POST /api/search
```

### Request

```json
{
  "query": "When is the release date of Sora 2?"
}
```

### Response

```json
{
  "query": "When is the release date of Sora 2?",
  "answer": "Sora 2, OpenAI's next-generation video AI model...",
  "sources": [
    {
      "title": "Article Title",
      "url": "https://example.com/article"
    }
  ],
  "processingTime": "18.5s"
}
```

## Deployment

### Deploy to Replit

1. Create a new Repl
2. Import from GitHub or upload files
3. Click "Run"
4. Your API is live!

### Deploy to Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy!

## Code Examples

### Python

```python
import requests

response = requests.post(
    "http://localhost:3000/api/search",
    json={"query": "When is the release date of Sora 2?"}
)

data = response.json()
print("Answer:", data['answer'])
```

### JavaScript

```javascript
const response = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: "When is the release date of Sora 2?" })
});

const data = await response.json();
console.log(data.answer);
```

### cURL

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "When is the release date of Sora 2?"}'
```

## Documentation

Visit the root URL (e.g., `http://localhost:3000`) to access the beautiful interactive documentation.

## Architecture

- **Backend**: Node.js + Express
- **Web Scraping**: Axios + Cheerio + Mozilla Readability
- **AI Model**: NVIDIA LLama-4 Maverick (17B parameters)
- **Search Engine**: DuckDuckGo HTML (no API key required)

## Configuration

All configuration is in `lib/search-engine.js`:

- `AI_CONFIG`: AI model settings
- `SEARCH_CONFIG`: Search behavior (max results, timeouts, delays)

## Limitations

- Queries take 15-30 seconds to complete (due to scraping + AI processing)
- Free tier deployments may have timeouts on very complex queries
- Search engines may occasionally block requests (uses delays and user-agent rotation to minimize this)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
