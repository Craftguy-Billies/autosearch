# 🔍 Alternative Search Solutions

If DuckDuckGo and Bing are blocking your hosting provider's IP, here are reliable alternatives:

---

## Option 1: SerpAPI (Recommended) ⭐

**Free Tier:** 100 searches/month  
**Pros:** Reliable, fast, accurate, multiple search engines  
**Cost:** $50/month for 5,000 searches after free tier

### Setup:

1. **Sign up**: https://serpapi.com/users/sign_up
2. **Get API key**: https://serpapi.com/manage-api-key
3. **Install package**:
   ```bash
   npm install serpapi
   ```

4. **Add to your code**: Already implemented! Just set environment variable:
   ```bash
   # In Render/Railway/etc
   SERPAPI_KEY=your_api_key_here
   ```

### Code Implementation (already prepared):

```javascript
// Add to lib/search-engine.js
import { getJson } from 'serpapi';

async function searchWithSerpAPI(query, maxResults = 5) {
  try {
    const response = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: maxResults
    });

    const results = [];
    if (response.organic_results) {
      for (const result of response.organic_results.slice(0, maxResults)) {
        results.push({
          title: result.title,
          url: result.link,
          snippet: result.snippet || ''
        });
      }
    }

    return results;
  } catch (error) {
    console.error('SerpAPI search failed:', error.message);
    throw error;
  }
}
```

---

## Option 2: ScraperAPI

**Free Tier:** 1,000 requests/month  
**Pros:** Handles all the proxy/captcha stuff automatically  
**Cost:** $49/month for 100,000 requests

### Setup:

1. **Sign up**: https://www.scraperapi.com/
2. **Get API key**: Dashboard → API Key
3. **Install**:
   ```bash
   npm install axios
   ```

4. **Use with your existing code**:
   ```javascript
   // Proxy all requests through ScraperAPI
   const response = await axios.get(
     `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(searchUrl)}`
   );
   ```

---

## Option 3: Brave Search API

**Free Tier:** 2,000 queries/month  
**Pros:** Privacy-focused, fast, good results  
**Cost:** $3 per 1,000 queries after free tier

### Setup:

1. **Sign up**: https://brave.com/search/api/
2. **Get API key**: Developer dashboard
3. **Use REST API**:
   ```javascript
   async function searchBrave(query, maxResults = 5) {
     const response = await axios.get(
       `https://api.search.brave.com/res/v1/web/search`,
       {
         params: { q: query, count: maxResults },
         headers: {
           'X-Subscription-Token': process.env.BRAVE_API_KEY
         }
       }
     );
     
     return response.data.web.results.map(r => ({
       title: r.title,
       url: r.url,
       snippet: r.description
     }));
   }
   ```

---

## Option 4: Google Custom Search API

**Free Tier:** 100 queries/day  
**Pros:** Official Google API, very reliable  
**Cost:** $5 per 1,000 queries after free tier

### Setup:

1. **Create project**: https://console.cloud.google.com/
2. **Enable Custom Search API**
3. **Create Search Engine**: https://programmablesearchengine.google.com/
4. **Get credentials**: API Key + Search Engine ID

---

## Quick Implementation

Let me create a version that automatically uses SerpAPI if available:

```javascript
// Updated smartSearch function
async function smartSearch(query, maxResults = 5) {
  console.log(`[DEBUG] === Smart Search Starting ===`);
  
  // Try SerpAPI first if API key is available
  if (process.env.SERPAPI_KEY) {
    try {
      console.log('[DEBUG] Using SerpAPI...');
      const results = await searchWithSerpAPI(query, maxResults);
      if (results.length > 0) {
        console.log(`[DEBUG] ✅ SerpAPI returned ${results.length} results`);
        return results;
      }
    } catch (error) {
      console.error('[DEBUG] SerpAPI failed:', error.message);
    }
  }
  
  // Fallback to DuckDuckGo
  try {
    console.log('[DEBUG] Attempting DuckDuckGo search...');
    const results = await searchDuckDuckGo(query, maxResults);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.error('[DEBUG] DuckDuckGo failed');
  }
  
  // Fallback to Bing
  try {
    console.log('[DEBUG] Attempting Bing search...');
    const results = await searchBing(query, maxResults);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.error('[DEBUG] Bing failed');
  }
  
  return [];
}
```

---

## Cost Comparison

For **500 searches/month**:

| Service | Cost | Notes |
|---------|------|-------|
| DuckDuckGo/Bing | FREE | May get blocked |
| SerpAPI | FREE | 100 free, then $50/mo |
| ScraperAPI | FREE | 1,000 free, then $49/mo |
| Brave Search | FREE | 2,000 free, then $1.50 |
| Google Custom | FREE | Limited to 100/day |

**Recommendation for your use case:**
- **Development/Testing**: Use free DuckDuckGo/Bing
- **Light Production**: Brave Search API (2,000 free/month)
- **Heavy Production**: SerpAPI or ScraperAPI

---

## Would you like me to:

1. **Implement SerpAPI support** (recommended)
2. **Implement Brave Search API** (best free option)
3. **Try deploying to Railway/Render first** to see if blocking is actually an issue

Let me know and I'll implement the solution!
