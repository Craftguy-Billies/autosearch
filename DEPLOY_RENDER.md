# 🚀 Deploy to Render - Complete Guide

Render is **RECOMMENDED** for this project because:
- ✅ Less likely to be blocked by search engines
- ✅ Better performance and reliability
- ✅ Easy GitHub integration
- ✅ Free tier available

## Step-by-Step Deployment

### 1. Create Render Account
Go to https://render.com and sign up (free)

### 2. Connect GitHub
1. Click **"New +"** button
2. Select **"Web Service"**
3. Click **"Connect account"** under GitHub
4. Authorize Render to access your repositories

### 3. Select Your Repository
1. Find: `Craftguy-Billies/autosearch`
2. Click **"Connect"**

### 4. Configure the Service

Fill in these settings:

**Basic Settings:**
- **Name**: `ai-search-api` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type:**
- Select **"Free"** (this will sleep after 15 min of inactivity)

### 5. Environment Variables (Optional)
If you want to hide the API key:
- Click **"Advanced"**
- Add environment variable:
  - Key: `NVIDIA_API_KEY`
  - Value: `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`

### 6. Deploy!
Click **"Create Web Service"**

Render will:
1. Clone your repository
2. Run `npm install`
3. Start your server with `node server.js`
4. Give you a URL like: `https://ai-search-api.onrender.com`

### 7. Wait for Deployment
- First deployment takes ~5 minutes
- Watch the logs in real-time
- Look for: `🚀 Search API server running on port XXXX`

### 8. Test Your API

Once deployed, test it:

```bash
curl -X POST https://YOUR-APP-NAME.onrender.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Python programming?"}'
```

Or visit: `https://YOUR-APP-NAME.onrender.com` for the documentation!

---

## Important Notes

### Free Tier Limitations
- ⏱️ **Sleeps after 15 minutes** of inactivity
- 🐌 **Takes ~30 seconds** to wake up on first request
- 💾 **750 hours/month** of runtime (enough for most use cases)
- 🔄 **Automatic restarts** if it crashes

### Keeping It Awake (Optional)
Use a free service like **UptimeRobot** or **Cron-job.org**:
1. Create a monitor that pings your health endpoint every 14 minutes:
   ```
   https://YOUR-APP-NAME.onrender.com/api/health
   ```
2. This keeps it awake during business hours

### Upgrading to Paid
If you need 24/7 uptime:
- **Starter Plan**: $7/month
- No sleep, always available
- Better resources

---

## Troubleshooting

### Deployment Failed
Check the logs for errors. Common issues:
- **Port error**: Make sure `server.js` uses `process.env.PORT` (already configured ✅)
- **Dependencies failed**: Sometimes `npm install` times out, just click "Manual Deploy" again

### App is Slow
- First request after sleep takes ~30s (this is normal on free tier)
- Subsequent requests are fast
- Consider upgrading to paid tier for instant responses

### Search Engines Blocking
If Render's IP also gets blocked:
- Try the **SerpAPI integration** (see ALTERNATIVE_SEARCH.md)
- Or upgrade to use residential proxies

---

## After Deployment

Update your test script:

```python
# In test_live.py or test_api.py
API_URL = "https://YOUR-APP-NAME.onrender.com/api/search"
```

Then test:
```bash
cd /Users/billiez/search_web
source venv/bin/activate
python test_api.py
```

---

## Monitoring Your App

Render provides:
- 📊 **Logs**: Real-time application logs
- 📈 **Metrics**: CPU, Memory, Request stats
- 🔔 **Alerts**: Email notifications on failures
- 🔄 **Auto-deploy**: Automatically deploys when you push to GitHub

---

## Next Steps

1. Deploy to Render
2. Test the API
3. Check the logs for `[DEBUG]` messages
4. If search engines are blocking, we can implement alternative solutions

Let me know your Render URL once deployed and I'll help you test it!
