import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Search using Google via SerpAPI (if API key available)
 * Free tier: 100 searches/month
 * Sign up: https://serpapi.com
 */
export async function searchWithSerpAPI(query, maxResults = 5) {
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY not configured');
  }

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: apiKey,
        engine: 'google',
        num: maxResults
      }
    });

    const results = [];
    if (response.data.organic_results) {
      for (const result of response.data.organic_results.slice(0, maxResults)) {
        results.push({
          title: result.title,
          url: result.link,
          snippet: result.snippet || ''
        });
      }
    }

    console.log(`[DEBUG] SerpAPI returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error('[DEBUG] SerpAPI error:', error.message);
    throw error;
  }
}

/**
 * Simple search using direct Google HTML scraping
 * Works without API keys but may be blocked
 */
export async function searchGoogleDirect(query, maxResults = 5) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${maxResults}`;
    console.log(`[DEBUG] Google Direct URL: ${searchUrl}`);
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Google results are in div.g
    $('div.g').each((index, element) => {
      if (results.length >= maxResults) return false;
      
      const $result = $(element);
      const $link = $result.find('a');
      const $title = $result.find('h3');
      const $snippet = $result.find('div[data-sncf]').first();
      
      const url = $link.attr('href');
      const title = $title.text().trim();
      const snippet = $snippet.text().trim();
      
      if (url && title && url.startsWith('http')) {
        results.push({ title, url, snippet });
        console.log(`[DEBUG] Google result: ${title.substring(0, 50)}`);
      }
    });

    console.log(`[DEBUG] Google Direct returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error('[DEBUG] Google Direct error:', error.message);
    throw error;
  }
}

/**
 * Search using Brave Search API (free tier: 2000/month)
 * Sign up: https://brave.com/search/api/
 */
export async function searchBrave(query, maxResults = 5) {
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY not configured');
  }

  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: {
        q: query,
        count: maxResults
      },
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    const results = [];
    if (response.data.web && response.data.web.results) {
      for (const result of response.data.web.results.slice(0, maxResults)) {
        results.push({
          title: result.title,
          url: result.url,
          snippet: result.description || ''
        });
      }
    }

    console.log(`[DEBUG] Brave API returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error('[DEBUG] Brave API error:', error.message);
    throw error;
  }
}
