import axios from 'axios';

/**
 * Search using SerpAPI (Google search)
 * Sign up at https://serpapi.com for free 100 searches/month
 */
export async function searchWithSerpAPI(query, maxResults = 5) {
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    throw new Error('SERPAPI_KEY environment variable not set');
  }

  try {
    console.log(`[DEBUG] Using SerpAPI for: "${query}"`);
    
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: apiKey,
        q: query,
        num: maxResults,
        engine: 'google'
      },
      timeout: 10000
    });

    const results = [];
    
    if (response.data.organic_results) {
      for (const result of response.data.organic_results.slice(0, maxResults)) {
        results.push({
          title: result.title,
          url: result.link,
          snippet: result.snippet || ''
        });
        console.log(`[DEBUG] SerpAPI result: ${result.title.substring(0, 50)}`);
      }
    }

    console.log(`[DEBUG] SerpAPI returned ${results.length} results`);
    return results;
  } catch (error) {
    console.error('[DEBUG] SerpAPI error:', error.message);
    throw error;
  }
}
