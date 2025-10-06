#!/bin/bash

echo "🚀 Deploying AI Search API to Vercel..."
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""
echo "🔐 You'll need to login with GitHub (no credit card required!)"
echo ""

# Deploy
vercel

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📝 To update your test script, copy your Vercel URL and run:"
echo "   cd /Users/billiez/search_web"
echo "   source venv/bin/activate"
echo "   # Edit test_api.py to use your new Vercel URL"
echo "   python test_api.py"
