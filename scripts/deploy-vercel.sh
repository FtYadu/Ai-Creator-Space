#!/bin/bash

# Vercel Deployment Script for AI Creator Space
# Usage: ./scripts/deploy-vercel.sh

set -e

echo "🚀 AI Creator Space - Vercel Deployment Script"
echo "=============================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check for required environment variables
if [ -z "$VITE_GEMINI_API_KEY" ]; then
    echo "⚠️  VITE_GEMINI_API_KEY not set in environment"
    read -p "Enter your Gemini API key: " GEMINI_KEY
    export VITE_GEMINI_API_KEY=$GEMINI_KEY
fi

# Optional weather API key
if [ -z "$VITE_OPENWEATHER_API_KEY" ]; then
    echo "⚠️  VITE_OPENWEATHER_API_KEY not set (optional)"
    read -p "Enter your OpenWeather API key (or press Enter to skip): " WEATHER_KEY
    if [ -n "$WEATHER_KEY" ]; then
        export VITE_OPENWEATHER_API_KEY=$WEATHER_KEY
    fi
fi

# Run tests
echo "📝 Running tests..."
npm test

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel dashboard if not already set"
echo "2. Visit your deployment URL to verify"
echo "3. Test all features"
echo ""
echo "To set environment variables:"
echo "  vercel env add VITE_GEMINI_API_KEY production"
echo "  vercel env add VITE_OPENWEATHER_API_KEY production"
