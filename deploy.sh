#!/bin/bash

# AI Search API - Quick Start Script
# This script helps you prepare and deploy to Replit

echo "🚀 AI Search API - Deployment Helper"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Option menu
echo "Choose deployment method:"
echo "1) Prepare for manual upload to Replit"
echo "2) Initialize Git for GitHub import to Replit"
echo "3) Create zip file for upload"
echo "4) Test locally before deployment"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 Manual Upload Instructions:"
        echo "================================"
        echo ""
        echo "1. Go to https://replit.com and create account"
        echo "2. Click 'Create Repl' → Select 'Node.js'"
        echo "3. Name it 'ai-search-api' (or your choice)"
        echo "4. Upload these folders/files:"
        echo "   - server.js"
        echo "   - package.json"
        echo "   - .replit"
        echo "   - replit.nix"
        echo "   - lib/ (entire folder)"
        echo "   - public/ (entire folder)"
        echo ""
        echo "5. Click Run button!"
        echo ""
        echo "✅ All files are ready in: $(pwd)"
        echo ""
        ;;
    
    2)
        echo ""
        echo "🔧 Initializing Git repository..."
        
        if [ -d ".git" ]; then
            echo "⚠️  Git already initialized"
        else
            git init
            echo "✅ Git initialized"
        fi
        
        # Create .gitignore if needed
        if [ ! -f ".gitignore" ]; then
            cat > .gitignore << EOF
node_modules/
.env
*.log
.DS_Store
venv/
__pycache__/
EOF
            echo "✅ .gitignore created"
        fi
        
        git add .
        git commit -m "Initial commit - AI Search API" 2>/dev/null
        
        echo ""
        echo "📋 Next steps:"
        echo "=============="
        echo ""
        echo "1. Create a new repository on GitHub.com"
        echo "2. Run these commands:"
        echo ""
        echo "   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
        echo "3. Go to Replit.com → 'Create Repl' → 'Import from GitHub'"
        echo "4. Paste your GitHub repo URL"
        echo ""
        ;;
    
    3)
        echo ""
        echo "📦 Creating deployment package..."
        
        zip_name="ai-search-api-$(date +%Y%m%d-%H%M%S).zip"
        
        zip -r "$zip_name" \
            server.js \
            package.json \
            .replit \
            replit.nix \
            README.md \
            lib/ \
            public/ \
            -x "node_modules/*" "venv/*" ".git/*" "*.pyc" "__pycache__/*"
        
        echo ""
        echo "✅ Created: $zip_name"
        echo ""
        echo "📋 Upload instructions:"
        echo "1. Go to Replit.com → Create Repl → Node.js"
        echo "2. Use 'Upload zip' feature"
        echo "3. Upload: $zip_name"
        echo ""
        ;;
    
    4)
        echo ""
        echo "🧪 Testing local server..."
        echo ""
        
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        
        echo ""
        echo "Starting server on http://localhost:3000"
        echo "Press Ctrl+C to stop"
        echo ""
        
        node server.js
        ;;
    
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
