#!/bin/bash

# Docker Deployment Script for AI Creator Space
# Usage: ./scripts/deploy-docker.sh

set -e

echo "🐳 AI Creator Space - Docker Deployment Script"
echo "============================================="

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📁 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check for required environment variables
if [ -z "$VITE_GEMINI_API_KEY" ]; then
    echo "❌ VITE_GEMINI_API_KEY not set"
    echo "Please create a .env file or set the variable:"
    echo "  export VITE_GEMINI_API_KEY=your_key_here"
    exit 1
fi

# Get Docker image name
read -p "Enter Docker image name (default: ai-creator-space): " IMAGE_NAME
IMAGE_NAME=${IMAGE_NAME:-ai-creator-space}

# Get Docker registry (optional)
read -p "Enter Docker registry (e.g., username/image, or press Enter to skip): " REGISTRY
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME"
else
    FULL_IMAGE_NAME="$IMAGE_NAME"
fi

echo "🔨 Building Docker image: $FULL_IMAGE_NAME"
docker build \
  --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" \
  --build-arg VITE_OPENWEATHER_API_KEY="${VITE_OPENWEATHER_API_KEY:-}" \
  -t "$FULL_IMAGE_NAME:latest" \
  -t "$FULL_IMAGE_NAME:$(date +%Y%m%d-%H%M%S)" \
  .

echo "✅ Docker image built successfully!"

# Ask if user wants to run locally
read -p "Run container locally? (y/n): " RUN_LOCAL
if [ "$RUN_LOCAL" = "y" ] || [ "$RUN_LOCAL" = "Y" ]; then
    PORT="${PORT:-8080}"
    echo "🚀 Starting container on port $PORT..."
    docker run -d \
      -p $PORT:80 \
      --name ai-creator-space \
      --restart unless-stopped \
      "$FULL_IMAGE_NAME:latest"

    echo "✅ Container started!"
    echo "🌐 Access at: http://localhost:$PORT"
    echo "📊 View logs: docker logs ai-creator-space -f"
    echo "🛑 Stop: docker stop ai-creator-space"
fi

# Ask if user wants to push to registry
if [ -n "$REGISTRY" ]; then
    read -p "Push to Docker registry? (y/n): " PUSH_IMAGE
    if [ "$PUSH_IMAGE" = "y" ] || [ "$PUSH_IMAGE" = "Y" ]; then
        echo "📤 Pushing to registry..."
        docker push "$FULL_IMAGE_NAME:latest"
        docker push "$FULL_IMAGE_NAME:$(date +%Y%m%d-%H%M%S)"
        echo "✅ Push complete!"
    fi
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs ai-creator-space -f"
echo "  Stop:         docker stop ai-creator-space"
echo "  Remove:       docker rm ai-creator-space"
echo "  Restart:      docker restart ai-creator-space"
