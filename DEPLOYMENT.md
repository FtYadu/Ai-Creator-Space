# Deployment Guide

Complete guide for deploying AI Creator Space to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
4. [Vercel Deployment](#vercel-deployment)
5. [Netlify Deployment](#netlify-deployment)
6. [Docker Deployment](#docker-deployment)
7. [GitHub Actions Setup](#github-actions-setup)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- Node.js 18+ installed
- Git repository access
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Optional

- OpenWeather API key from [OpenWeatherMap](https://openweathermap.org/api)
- Vercel account (for Vercel deployment)
- Netlify account (for Netlify deployment)
- Docker Hub account (for Docker deployment)

---

## Environment Variables

### Required Variables

```bash
# Gemini API Key (REQUIRED)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Variables

```bash
# OpenWeather API Key (OPTIONAL - uses mock data if not provided)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Getting API Keys

#### Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

#### OpenWeather API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to "API keys" section
4. Generate a new key

---

## Deployment Options

### Quick Comparison

| Platform    | Setup Time | Cost                       | Best For                        |
| ----------- | ---------- | -------------------------- | ------------------------------- |
| **Vercel**  | 5-10 min   | Free tier available        | Fastest deployment, recommended |
| **Netlify** | 5-10 min   | Free tier available        | Alternative to Vercel           |
| **Docker**  | 15-30 min  | Variable (cloud dependent) | Full control, self-hosting      |

---

## Vercel Deployment

### Option 1: CLI Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add VITE_GEMINI_API_KEY production
vercel env add VITE_OPENWEATHER_API_KEY production

# Trigger new deployment with env vars
vercel --prod
```

### Option 2: GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_OPENWEATHER_API_KEY` (optional)
6. Click "Deploy"

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Ai-Creator-Space)

---

## Netlify Deployment

### Option 1: CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize deployment
netlify init

# Deploy to production
netlify deploy --prod

# Set environment variables
netlify env:set VITE_GEMINI_API_KEY your_key_here
netlify env:set VITE_OPENWEATHER_API_KEY your_key_here
```

### Option 2: GitHub Integration

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add Environment Variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_OPENWEATHER_API_KEY` (optional)
6. Click "Deploy site"

### Option 3: Drag & Drop

```bash
# Build locally
npm run build

# Go to Netlify Dashboard → Sites → Drag & drop
# Upload the 'dist' folder
```

---

## Docker Deployment

### Local Docker Build & Run

```bash
# Build the Docker image
docker build -t ai-creator-space \
  --build-arg VITE_GEMINI_API_KEY=your_key_here \
  --build-arg VITE_OPENWEATHER_API_KEY=your_weather_key \
  .

# Run the container
docker run -d \
  -p 8080:80 \
  --name ai-creator-space \
  ai-creator-space

# Access at http://localhost:8080
```

### Docker Compose

```bash
# Create .env file
echo "VITE_GEMINI_API_KEY=your_key_here" > .env
echo "VITE_OPENWEATHER_API_KEY=your_weather_key" >> .env

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Push to Docker Hub

```bash
# Tag the image
docker tag ai-creator-space your_username/ai-creator-space:latest

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push your_username/ai-creator-space:latest
```

### Deploy to Cloud Providers

#### AWS ECS

```bash
# Use AWS CLI or AWS Console to:
# 1. Create ECS cluster
# 2. Create task definition using your Docker image
# 3. Create service
# 4. Configure load balancer
```

#### Google Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy ai-creator-space \
  --image your_username/ai-creator-space:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_GEMINI_API_KEY=your_key_here
```

#### Azure Container Instances

```bash
# Deploy to Azure
az container create \
  --resource-group myResourceGroup \
  --name ai-creator-space \
  --image your_username/ai-creator-space:latest \
  --dns-name-label ai-creator-space \
  --ports 80
```

---

## GitHub Actions Setup

### Required GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

#### For All Deployments

- `GEMINI_API_KEY` - Your Gemini API key
- `OPENWEATHER_API_KEY` - Your OpenWeather API key (optional)

#### For Vercel

- `VERCEL_TOKEN` - Get from Vercel Settings → Tokens
- `VERCEL_ORG_ID` - Found in Vercel project settings
- `VERCEL_PROJECT_ID` - Found in Vercel project settings

#### For Netlify

- `NETLIFY_AUTH_TOKEN` - Get from Netlify User Settings → Applications
- `NETLIFY_SITE_ID` - Found in Netlify site settings

#### For Docker Hub

- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub access token

### Triggering Deployments

```bash
# Automatic deployment on push to main/master
git push origin main

# Manual deployment trigger
# Go to: Actions → Deploy → Run workflow
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check deployment URL
curl https://your-deployment-url.com/health

# Expected response: "healthy"
```

### 2. Test Features

- [ ] Image generation works
- [ ] Video generation works
- [ ] Voice assistant connects
- [ ] Chat functionality works
- [ ] Project creation/deletion works
- [ ] Media upload/download works
- [ ] Export/import functionality works
- [ ] Theme switching works
- [ ] All keyboard shortcuts work

### 3. Monitor Performance

- Check browser console for errors
- Monitor API usage in Gemini AI Studio
- Check deployment platform metrics
- Monitor error rates

### 4. Set Up Custom Domain (Optional)

#### Vercel

```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS records as instructed
```

#### Netlify

1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records

### 5. Enable Analytics (Optional)

Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module '@google/genai'"**

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "GEMINI_API_KEY is not defined"**

```bash
# Solution: Set environment variable
export VITE_GEMINI_API_KEY=your_key_here
npm run build
```

### Runtime Errors

**"Failed to load Gemini API"**

- Check if VITE_GEMINI_API_KEY is set correctly
- Verify API key is valid in Google AI Studio
- Check browser console for CORS errors

**"Weather API not working"**

- This is expected if VITE_OPENWEATHER_API_KEY is not set
- App falls back to mock weather data
- Optional: Add OpenWeather API key

### Docker Issues

**"Port 80 already in use"**

```bash
# Use different port
docker run -p 8081:80 ai-creator-space
```

**"Build fails in Docker"**

```bash
# Check build args are passed correctly
docker build --build-arg VITE_GEMINI_API_KEY=your_key .
```

### Performance Issues

**Slow initial load**

- Enable caching in deployment platform
- Use CDN for static assets
- Optimize images

**High API costs**

- Implement rate limiting
- Add request caching
- Monitor API usage

---

## Support

For issues or questions:

- Check the [Architecture Documentation](./ARCHITECTURE.md)
- Review [Contributing Guidelines](./CONTRIBUTING.md)
- Open an issue on GitHub

---

## Security Checklist

- [ ] API keys stored as secrets (not in code)
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Security headers configured
- [ ] CSP (Content Security Policy) enabled
- [ ] Regular dependency updates
- [ ] Error tracking configured
- [ ] Backup strategy in place

---

## Maintenance

### Regular Tasks

**Weekly:**

- Check error logs
- Monitor API usage
- Review performance metrics

**Monthly:**

- Update dependencies: `npm update`
- Security audit: `npm audit`
- Review and rotate API keys

**Quarterly:**

- Full security audit
- Performance optimization review
- Backup verification

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
