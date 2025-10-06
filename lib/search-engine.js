import axios from 'axios';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const AI_CONFIG = {
  url: 'https://integrate.api.nvidia.com/v1/chat/completions',
  apiKey: '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',
  model: 'meta/llama-4-maverick-17b-128e-instruct',
  maxRetries: 3
};

const SEARCH_CONFIG = {
  maxResults: 5,
  timeout: 10000,
  delayBetweenRequests: 2000,
  userAgents: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]
};

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get random user agent
const getRandomUserAgent = () => {
  return SEARCH_CONFIG.userAgents[Math.floor(Math.random() * SEARCH_CONFIG.userAgents.length)];
};

/**
 * Call AI model with retry logic
 */
async function callAI(prompt, systemPrompt = '', retries = AI_CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await axios.post(
        AI_CONFIG.url,
        {
          model: AI_CONFIG.model,
          messages: messages,
          max_tokens: 512,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content.trim();
      return content;
    } catch (error) {
      console.error(`AI call attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        throw new Error(`AI call failed after ${retries} attempts: ${error.message}`);
      }
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
}

/**
 * Optimize user query into search queries
 */
async function optimizeQuery(userQuery) {
  const systemPrompt = `You are a search query optimizer. Your task is to convert user questions into optimized search engine queries.
Rules:
1. Output ONLY a JSON array of strings, nothing else
2. Generate 1-3 short, focused search queries
3. Use the same language as the input
4. Remove question words, keep only keywords
5. Format: ["query1", "query2", "query3"]

Examples:
Input: "When is the release date of Sora 2?"
Output: ["Sora 2 release date", "OpenAI Sora 2 launch"]

Input: "What is the capital of France?"
Output: ["France capital"]`;

  const prompt = `Convert this to search queries: "${userQuery}"

Output only the JSON array:`;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await callAI(prompt, systemPrompt);
      console.log(`AI query optimization response (attempt ${attempt}):`, response);
      
      // Try to extract JSON array from response
      let queries;
      
      // Try direct parse
      try {
        queries = JSON.parse(response);
        if (Array.isArray(queries) && queries.length > 0) {
          console.log('Optimized queries:', queries);
          return queries.slice(0, 3); // Max 3 queries
        }
      } catch (e) {
        // Try to extract array from text
        const arrayMatch = response.match(/\[.*\]/s);
        if (arrayMatch) {
          queries = JSON.parse(arrayMatch[0]);
          if (Array.isArray(queries) && queries.length > 0) {
            console.log('Extracted optimized queries:', queries);
            return queries.slice(0, 3);
          }
        }
      }
      
      // If still failed, try one more time with more explicit prompt
      if (attempt < 5) {
        console.log('Failed to parse, retrying with more explicit prompt...');
        await sleep(1000);
      }
    } catch (error) {
      console.error(`Query optimization attempt ${attempt} failed:`, error.message);
      if (attempt === 5) {
        // Fallback: use original query
        console.log('Using fallback: original query');
        return [userQuery];
      }
    }
  }
  
  return [userQuery]; // Ultimate fallback
}

/**
 * Search DuckDuckGo HTML - Improved version
 */
async function searchDuckDuckGo(query, maxResults = 5) {
  try {
    const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: SEARCH_CONFIG.timeout
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // DuckDuckGo Lite has simpler structure: td elements with links
    $('tr').each((index, element) => {
      if (results.length >= maxResults) return false;
      
      const $row = $(element);
      const $links = $row.find('a.result-link');
      
      if ($links.length > 0) {
        const $link = $links.first();
        const title = $link.text().trim();
        const href = $link.attr('href');
        
        // Extract snippet from the row
        const $snippet = $row.find('.result-snippet');
        const snippet = $snippet.text().trim();
        
        if (href && title && href.startsWith('http')) {
          results.push({ title, url: href, snippet });
        }
      }
    });

    console.log(`Found ${results.length} results from DuckDuckGo for: "${query}"`);
    
    // If no results with lite, try alternative parsing
    if (results.length === 0) {
      console.log('Trying alternative DuckDuckGo parsing...');
      
      // Try finding all links in the page
      $('a').each((index, element) => {
        if (results.length >= maxResults) return false;
        
        const $link = $(element);
        const href = $link.attr('href');
        const text = $link.text().trim();
        
        // Filter out navigation links and keep only result links
        if (href && text && 
            href.startsWith('http') && 
            !href.includes('duckduckgo.com') &&
            text.length > 10) {
          
          // Get snippet from parent or nearby text
          const $parent = $link.parent();
          const snippet = $parent.text().substring(0, 200).trim();
          
          results.push({ 
            title: text.substring(0, 100), 
            url: href, 
            snippet 
          });
        }
      });
      
      console.log(`Found ${results.length} results with alternative parsing`);
    }
    
    return results;
  } catch (error) {
    console.error('DuckDuckGo search failed:', error.message);
    throw error;
  }
}

/**
 * Alternative search using Bing (fallback)
 */
async function searchBing(query, maxResults = 5) {
  try {
    // Use Bing HTML search as fallback
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&format=html`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: SEARCH_CONFIG.timeout
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Bing results are in li.b_algo
    $('li.b_algo').each((index, element) => {
      if (results.length >= maxResults) return false;
      
      const $result = $(element);
      const $link = $result.find('h2 a');
      const $snippet = $result.find('.b_caption p');
      
      const title = $link.text().trim();
      const url = $link.attr('href');
      const snippet = $snippet.text().trim();
      
      if (url && title && url.startsWith('http')) {
        results.push({ title, url, snippet });
      }
    });

    console.log(`Found ${results.length} results from Bing for: "${query}"`);
    return results;
  } catch (error) {
    console.error('Bing search failed:', error.message);
    throw error;
  }
}

/**
 * Smart search with fallback
 */
async function smartSearch(query, maxResults = 5) {
  console.log(`Attempting to search for: "${query}"`);
  
  // Try DuckDuckGo first
  try {
    const results = await searchDuckDuckGo(query, maxResults);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.error('DuckDuckGo failed, trying Bing...');
  }
  
  // Fallback to Bing
  try {
    const results = await searchBing(query, maxResults);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.error('Bing also failed');
  }
  
  return [];
}

/**
 * Extract main content from webpage
 */
async function extractContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: SEARCH_CONFIG.timeout,
      maxRedirects: 3
    });

    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article && article.textContent) {
      // Get first 3000 characters of main content
      const content = article.textContent.substring(0, 3000).trim();
      return content;
    }

    // Fallback: extract paragraphs with cheerio
    const $ = cheerio.load(response.data);
    const paragraphs = [];
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 50) {
        paragraphs.push(text);
      }
    });

    return paragraphs.slice(0, 10).join('\n').substring(0, 3000);
  } catch (error) {
    console.error(`Content extraction failed for ${url}:`, error.message);
    return null;
  }
}

/**
 * Summarize content with AI
 */
async function summarizeContent(query, content, url) {
  const systemPrompt = `You are an expert at extracting relevant information from web content.
Extract ONLY information that directly answers or relates to the user's query.
Be concise and factual. Include specific details like dates, numbers, and names when relevant.
If the content doesn't contain relevant information, say "No relevant information found."`;

  const prompt = `Query: "${query}"

Content from ${url}:
${content}

Extract only the relevant information that answers the query. Be concise:`;

  try {
    const summary = await callAI(prompt, systemPrompt);
    return summary;
  } catch (error) {
    console.error('Summarization failed:', error.message);
    return 'Error summarizing content.';
  }
}

/**
 * Final synthesis of all summaries
 */
async function synthesizeFinalAnswer(query, summaries) {
  const systemPrompt = `You are an expert at synthesizing information from multiple sources.
Create a concise, precise answer to the user's query based on the provided summaries.
Include specific facts, dates, and details.
If information is conflicting, mention it.
Do not include preamble or fluff. Get straight to the answer.`;

  const prompt = `Query: "${query}"

Information from multiple sources:
${summaries.map((s, i) => `Source ${i + 1}: ${s.summary}`).join('\n\n')}

Provide a concise, factual answer:`;

  try {
    const finalAnswer = await callAI(prompt, systemPrompt);
    return finalAnswer;
  } catch (error) {
    console.error('Final synthesis failed:', error.message);
    return 'Unable to synthesize final answer.';
  }
}

/**
 * Main search and summarize function
 */
export async function searchAndSummarize(userQuery) {
  const startTime = Date.now();
  
  console.log('\n=== Starting search process ===');
  console.log('User query:', userQuery);
  
  // Step 1: Optimize query
  console.log('\n[Step 1] Optimizing query...');
  const optimizedQueries = await optimizeQuery(userQuery);
  console.log('Optimized queries:', optimizedQueries);
  
  // Step 2: Search and extract for each query
  const allSummaries = [];
  
  for (const query of optimizedQueries) {
    console.log(`\n[Step 2] Searching for: "${query}"`);
    
    try {
      // Search with smart fallback
      const searchResults = await smartSearch(query, SEARCH_CONFIG.maxResults);
      
      if (searchResults.length === 0) {
        console.log('No search results found');
        continue;
      }
      
      // Extract and summarize each result
      for (const result of searchResults) {
        console.log(`\nProcessing: ${result.title}`);
        console.log(`URL: ${result.url}`);
        
        await sleep(SEARCH_CONFIG.delayBetweenRequests); // Rate limiting
        
        const content = await extractContent(result.url);
        
        if (!content || content.length < 100) {
          console.log('Content too short or extraction failed');
          continue;
        }
        
        console.log(`Extracted ${content.length} characters`);
        console.log('Summarizing...');
        
        const summary = await summarizeContent(userQuery, content, result.url);
        
        if (summary && !summary.includes('No relevant information')) {
          allSummaries.push({
            url: result.url,
            title: result.title,
            summary: summary
          });
          console.log('Summary added');
        }
      }
    } catch (error) {
      console.error(`Error processing query "${query}":`, error.message);
      continue;
    }
  }
  
  console.log(`\n[Step 3] Synthesizing ${allSummaries.length} summaries...`);
  
  if (allSummaries.length === 0) {
    return {
      query: userQuery,
      answer: 'No relevant information found. Please try rephrasing your query.',
      sources: [],
      processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
    };
  }
  
  // Step 3: Synthesize final answer
  const finalAnswer = await synthesizeFinalAnswer(userQuery, allSummaries);
  
  const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n=== Search completed in ${processingTime}s ===\n`);
  
  return {
    query: userQuery,
    answer: finalAnswer,
    sources: allSummaries.map(s => ({
      title: s.title,
      url: s.url
    })),
    processingTime: `${processingTime}s`
  };
}
