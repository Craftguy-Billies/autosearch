"""
Python web scraping module using trafilatura and BeautifulSoup
Called from Node.js for better scraping capabilities
"""

import sys
import json
from trafilatura import fetch_url, extract
from trafilatura.settings import use_config
from bs4 import BeautifulSoup
import requests
from urllib.parse import quote_plus

def search_duckduckgo(query, max_results=5):
    """Search DuckDuckGo using HTML parsing"""
    try:
        search_url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = []
        
        # Find all result links
        for link in soup.find_all('a', class_='result__a', limit=max_results):
            title = link.get_text(strip=True)
            url = link.get('href')
            
            if url and title and url.startswith('http'):
                # Get snippet from parent
                snippet = ''
                parent = link.find_parent('td')
                if parent:
                    snippet_elem = parent.find('a', class_='result__snippet')
                    if snippet_elem:
                        snippet = snippet_elem.get_text(strip=True)
                
                results.append({
                    'title': title,
                    'url': url,
                    'snippet': snippet
                })
        
        return results
    except Exception as e:
        print(f"DuckDuckGo search error: {e}", file=sys.stderr)
        return []

def search_google(query, max_results=5):
    """Search Google using requests + BeautifulSoup"""
    try:
        search_url = f"https://www.google.com/search?q={quote_plus(query)}&num={max_results}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = []
        
        # Try multiple selectors for Google results
        selectors = ['div.g', 'div.tF2Cxc', 'div[data-sokoban-container]']
        
        for selector in selectors:
            search_results = soup.select(selector)
            
            for result in search_results[:max_results]:
                # Get link
                link = result.find('a')
                if not link or not link.get('href'):
                    continue
                
                url = link.get('href')
                if not url.startswith('http'):
                    continue
                
                # Get title
                title_elem = result.find('h3')
                if not title_elem:
                    continue
                title = title_elem.get_text(strip=True)
                
                # Get snippet
                snippet = ''
                snippet_selectors = ['div.VwiC3b', 'div[data-sncf]', 'span.aCOpRe', 'div.s']
                for snip_sel in snippet_selectors:
                    snip_elem = result.select_one(snip_sel)
                    if snip_elem:
                        snippet = snip_elem.get_text(strip=True)
                        break
                
                results.append({
                    'title': title,
                    'url': url,
                    'snippet': snippet
                })
                
                if len(results) >= max_results:
                    break
            
            if results:
                break
        
        return results
    except Exception as e:
        print(f"Google search error: {e}", file=sys.stderr)
        return []

def extract_content(url):
    """Extract main content from URL using trafilatura"""
    try:
        # Configure trafilatura for better extraction
        config = use_config()
        config.set("DEFAULT", "MIN_EXTRACTED_SIZE", "200")
        config.set("DEFAULT", "MIN_EXTRACTED_COMM_SIZE", "10")
        
        # Fetch and extract
        downloaded = fetch_url(url)
        if not downloaded:
            return None
        
        # Extract with trafilatura (best for articles)
        text = extract(
            downloaded,
            config=config,
            include_comments=False,
            include_tables=False,
            no_fallback=False
        )
        
        if text and len(text) > 200:
            return text[:3000]  # Limit to 3000 chars
        
        # Fallback to BeautifulSoup if trafilatura fails
        soup = BeautifulSoup(downloaded, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text from paragraphs
        paragraphs = soup.find_all('p')
        text = ' '.join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 50])
        
        return text[:3000] if text else None
        
    except Exception as e:
        print(f"Content extraction error for {url}: {e}", file=sys.stderr)
        return None

def main():
    """Main function called from Node.js"""
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Usage: python scraper.py <command> <args>'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == 'search':
            query = sys.argv[2]
            max_results = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            
            # Try DuckDuckGo first
            results = search_duckduckgo(query, max_results)
            
            # Fallback to Google if no results
            if not results:
                results = search_google(query, max_results)
            
            print(json.dumps({
                'success': True,
                'results': results,
                'count': len(results)
            }))
            
        elif command == 'extract':
            url = sys.argv[2]
            content = extract_content(url)
            
            print(json.dumps({
                'success': True,
                'content': content,
                'length': len(content) if content else 0
            }))
            
        else:
            print(json.dumps({'error': f'Unknown command: {command}'}))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({'error': str(e), 'success': False}))
        sys.exit(1)

if __name__ == '__main__':
    main()
