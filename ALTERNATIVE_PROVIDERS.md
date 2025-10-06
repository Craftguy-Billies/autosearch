# 🌐 Alternative Hosting Providers

If Replit and Render don't work due to IP blocking, here are alternatives:

---

## 1. Railway.app ⭐ (Highly Recommended)

**Why Railway:**
- ✅ $5 free credit per month
- ✅ Different IP range, less likely blocked
- ✅ Fast deployment
- ✅ GitHub integration

**Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd /Users/billiez/search_web
railway init

# Deploy
railway up
```

**Or use the web interface:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `autosearch`
5. Railway auto-detects Node.js and deploys!

**Pricing:** $5 free credit/month, then pay-as-you-go (~$5-10/month for light usage)

---

## 2. Fly.io 🚀

**Why Fly.io:**
- ✅ Free tier: 3 VMs with 256MB RAM
- ✅ Global edge network
- ✅ Good for web scraping (residential IPs available)

**Deploy to Fly.io:**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
cd /Users/billiez/search_web
flyctl launch

# Follow prompts:
# - App name: ai-search-api
# - Region: Choose closest
# - Database: No
# - Deploy now: Yes
```

**Pricing:** Free tier available, then $1.94/month per VM

---

## 3. Vercel (Serverless) ⚡

**Why Vercel:**
- ✅ Completely free for hobby projects
- ✅ Instant deployment
- ✅ Different IP per request (good for avoiding blocks)

**⚠️ Limitation:** 10-second timeout on free tier (may not work for long searches)

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/billiez/search_web
vercel

# Follow prompts, it auto-configures everything
```

**Note:** You'll need to add `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

---

## 4. Heroku (Paid Only Now)

**Why Heroku:**
- ✅ Very reliable
- ✅ Good documentation
- ❌ No free tier anymore

**Pricing:** $7/month minimum

**Deploy:**
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
cd /Users/billiez/search_web
heroku create ai-search-api

# Deploy
git push heroku main
```

---

## 5. DigitalOcean App Platform

**Why DigitalOcean:**
- ✅ Very reliable
- ✅ Good for production
- ✅ $5/month basic plan
- ✅ Less likely to be blocked

**Deploy:**
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub
4. Select `autosearch` repo
5. Choose "Basic" plan ($5/month)
6. Deploy!

---

## 6. Self-Hosted Options

### Option A: Your Own VPS

**Providers:**
- **Linode**: $5/month for 1GB RAM
- **Vultr**: $3.50/month for 512MB RAM
- **DigitalOcean Droplet**: $4/month

**Setup:**
```bash
# SSH into your server
ssh root@YOUR_IP

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clone and run
git clone https://github.com/Craftguy-Billies/autosearch.git
cd autosearch
npm install
node server.js

# Keep it running with PM2
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

### Option B: Run on Your Mac 24/7

**If you have a Mac that's always on:**
```bash
cd /Users/billiez/search_web

# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name "search-api"

# Make it start on boot
pm2 startup
pm2 save

# Optional: Use ngrok for public access
brew install ngrok
ngrok http 3000
# You'll get a public URL like: https://xxxxx.ngrok.io
```

---

## Comparison Table

| Provider | Free Tier | Best For | IP Blocking Risk |
|----------|-----------|----------|------------------|
| **Railway** ⭐ | $5 credit/mo | Best balance | Low |
| **Render** | Yes (sleeps) | Easy setup | Medium |
| **Fly.io** | Yes (3 VMs) | Global edge | Low |
| **Replit** | Yes (sleeps) | Quick testing | High |
| **Vercel** | Yes | Serverless | Very Low (different IPs) |
| **Heroku** | No | Production | Low |
| **DigitalOcean** | $5/mo | Production | Very Low |
| **Self-hosted** | Varies | Full control | Very Low |

---

## My Recommendation

### For Testing:
1. **Railway** (Best free option)
2. **Render** (Easy to use)

### For Production:
1. **Railway** ($5-10/month)
2. **DigitalOcean** ($5/month)
3. **Self-hosted VPS** (Most control)

---

## Still Getting Blocked?

If search engines block ALL providers, you have two options:

### Option 1: Use Official Search APIs

See `ALTERNATIVE_SEARCH.md` for:
- SerpAPI (100 searches/month free)
- ScraperAPI (1000 requests/month free)
- Brave Search API (free tier)

### Option 2: Use Proxy Services

Add residential proxy support:
```bash
npm install axios-proxy-fix
```

Then configure in `search-engine.js`:
```javascript
const proxy = {
  host: 'proxy.example.com',
  port: 8080,
  auth: {
    username: 'user',
    password: 'pass'
  }
};
```

---

Let me know which provider you want to try, and I'll help you deploy!
