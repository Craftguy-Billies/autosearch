import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Execute Python scraper script
 */
function runPythonScript(command, args) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(__dirname, '..', 'scraper.py');
    
    const python = spawn(pythonPath, [scriptPath, command, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('[Python] stderr:', stderr);
        reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });
    
    python.on('error', (error) => {
      reject(new Error(`Failed to start Python: ${error.message}`));
    });
  });
}

/**
 * Search using Python scraper
 */
export async function searchWithPython(query, maxResults = 5) {
  try {
    console.log('[DEBUG] Using Python scraper for search...');
    const result = await runPythonScript('search', [query, maxResults.toString()]);
    
    if (!result.success) {
      throw new Error(result.error || 'Python search failed');
    }
    
    console.log(`[DEBUG] Python scraper found ${result.count} results`);
    return result.results || [];
  } catch (error) {
    console.error('[DEBUG] Python search error:', error.message);
    throw error;
  }
}

/**
 * Extract content using Python scraper
 */
export async function extractWithPython(url) {
  try {
    console.log(`[DEBUG] Using Python trafilatura for: ${url}`);
    const result = await runPythonScript('extract', [url]);
    
    if (!result.success) {
      throw new Error(result.error || 'Python extraction failed');
    }
    
    console.log(`[DEBUG] Python extracted ${result.length} characters`);
    return result.content;
  } catch (error) {
    console.error('[DEBUG] Python extraction error:', error.message);
    return null;
  }
}
