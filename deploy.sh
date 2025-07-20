#!/bin/bash

echo "🚀 Deploying Recipe Bot to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Please log in to Fly.io first:"
    echo "   flyctl auth login"
    exit 1
fi

# Deploy the application
echo "📦 Building and deploying..."
flyctl deploy

echo "✅ Deployment complete!"
echo "🌐 Your Recipe Bot is now live at: https://$(flyctl info --json | jq -r '.Hostname')"

# Optional: Open the app
read -p "Would you like to open the app in your browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    flyctl open
fi
