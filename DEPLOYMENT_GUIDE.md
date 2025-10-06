# 🚀 Deploying to Replit - Step by Step Guide

## Method 1: Direct Upload (Easiest)

### Step 1: Create a Replit Account
1. Go to https://replit.com
2. Sign up or log in

### Step 2: Create a New Repl
1. Click "Create Repl" button
2. Select **"Node.js"** as the template
3. Name it: `ai-search-api` (or any name you like)
4. Click "Create Repl"

### Step 3: Upload Files
1. In the Replit file panel (left side), you'll see the file browser
2. Delete the default `index.js` file
3. Upload ALL files from your local project:
   - `server.js`
   - `package.json`
   - `README.md`
   - `.replit`
   - The entire `lib/` folder (with `search-engine.js`)
   - The entire `public/` folder (with `index.html`)

**To upload:**
- Click the three dots (...) next to "Files"
- Select "Upload file" or "Upload folder"
- Select all your project files

### Step 4: Configure Replit
The `.replit` file should already be configured, but verify it has:
```json
{
  "run": "node server.js"
}
```

### Step 5: Install Dependencies & Run
1. Replit will automatically detect `package.json` and install dependencies
2. Click the green "Run" button at the top
3. Wait for the server to start (you'll see the success message in console)

### Step 6: Access Your API
1. Once running, Replit will show you a preview window with your documentation
2. The URL will be something like: `https://ai-search-api.YOUR-USERNAME.repl.co`
3. Your API endpoint: `https://ai-search-api.YOUR-USERNAME.repl.co/api/search`

---

## Method 2: Import from GitHub (Recommended for updates)

### Step 1: Create GitHub Repository
First, let's push your code to GitHub:

```bash
cd /Users/billiez/search_web

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Search API"

# Create a repository on GitHub.com, then:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Replit
1. Go to https://replit.com
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Paste your GitHub repository URL
5. Click "Import from GitHub"
6. Replit will automatically set up everything!

---

## Method 3: Use Replit CLI (Advanced)

```bash
# Install Replit CLI
npm install -g replit-cli

# Login
replit login

# Deploy
replit deploy
```

---

## Important Notes

### Environment Variables (If Needed)
If you want to hide the API key:
1. Click "Secrets" (lock icon) in left sidebar
2. Add: `NVIDIA_API_KEY` = `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`
3. Update `lib/search-engine.js` to use: `process.env.NVIDIA_API_KEY`

### Keeping the API Alive
- **Free Replit accounts**: Repls go to sleep after inactivity
- **Solution**: Upgrade to Replit Hacker plan for always-on
- **Alternative**: Use a ping service like UptimeRobot to ping your API every 5 minutes

### Port Configuration
Replit automatically handles ports. The code `process.env.PORT || 3000` will work automatically.

---

## Testing Your Deployed API

### Using cURL:
```bash
curl -X POST https://YOUR-REPL-URL.repl.co/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "When is the release date of Sora 2?"}'
```

### Using Python:
```python
import requests

response = requests.post(
    "https://YOUR-REPL-URL.repl.co/api/search",
    json={"query": "When is the release date of Sora 2?"}
)

print(response.json())
```

### Using the Web Interface:
Just visit: `https://YOUR-REPL-URL.repl.co` and use the "Try It" tab!

---

## Troubleshooting

### Issue: Dependencies not installing
- Click "Shell" tab at bottom
- Run: `npm install`

### Issue: Port errors
- Replit uses dynamic ports, ensure you use `process.env.PORT`
- Already configured in `server.js`

### Issue: Timeout errors
- Replit free tier has ~10 minute timeout
- For long searches, consider upgrading or optimizing

### Issue: Rate limiting from search engines
- The code includes delays to prevent this
- If it happens, the fallback mechanisms will try alternative sources

---

## Next Steps After Deployment

1. **Test the API** with the Python script or web interface
2. **Share your API URL** with others
3. **Monitor usage** in Replit dashboard
4. **Upgrade** if you need always-on hosting

---

## Cost Comparison

| Platform | Free Tier | Always-On | Cost |
|----------|-----------|-----------|------|
| **Replit** | ✅ Yes (sleeps after inactivity) | Hacker Plan | $7/month |
| **Render** | ✅ Yes (sleeps after 15 min) | Paid Plans | $7/month |
| **Railway** | ✅ Yes ($5 free credit) | Pay as you go | Variable |
| **Heroku** | ❌ No (discontinued free tier) | Paid only | $7/month |

**Recommendation**: Start with Replit free tier for testing!
