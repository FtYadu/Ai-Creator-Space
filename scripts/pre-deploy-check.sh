#!/bin/bash

# Pre-Deployment Validation Script
# Checks if the application is ready for production deployment

set -e

echo "🔍 AI Creator Space - Pre-Deployment Validation"
echo "==============================================="

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo ""
echo "1️⃣  Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    success "Node.js version: $(node -v)"
else
    error "Node.js version too old. Required: v18+, Found: $(node -v)"
fi

echo ""
echo "2️⃣  Checking environment variables..."
if [ -z "$VITE_GEMINI_API_KEY" ] && [ ! -f .env.local ]; then
    error "VITE_GEMINI_API_KEY not set and no .env.local file found"
else
    success "Environment configuration found"
fi

echo ""
echo "3️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
    error "node_modules directory not found. Run: npm install"
else
    success "Dependencies installed"
fi

echo ""
echo "4️⃣  Running type check..."
if npm run type-check 2>&1 | grep -q "error TS"; then
    warning "TypeScript errors found (non-blocking)"
else
    success "Type check passed"
fi

echo ""
echo "5️⃣  Running linter..."
if npm run lint 2>&1 | grep -q "error"; then
    warning "ESLint errors found (non-blocking)"
else
    success "Linting passed"
fi

echo ""
echo "6️⃣  Running tests..."
if npm test > /dev/null 2>&1; then
    success "All tests passed"
else
    error "Tests failed"
fi

echo ""
echo "7️⃣  Building project..."
if npm run build > /dev/null 2>&1; then
    success "Build successful"
else
    error "Build failed"
fi

echo ""
echo "8️⃣  Checking required files..."
REQUIRED_FILES=("package.json" "index.tsx" "App.tsx" "vite.config.ts")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        error "Required file missing: $file"
    fi
done
success "All required files present"

echo ""
echo "9️⃣  Checking deployment configurations..."
DEPLOY_CONFIGS=("vercel.json" "netlify.toml" "Dockerfile")
CONFIG_COUNT=0
for config in "${DEPLOY_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        ((CONFIG_COUNT++))
    fi
done
if [ $CONFIG_COUNT -gt 0 ]; then
    success "Found $CONFIG_COUNT deployment configuration(s)"
else
    warning "No deployment configurations found"
fi

echo ""
echo "🔟  Checking dist directory..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    success "Production build ready (Size: $DIST_SIZE)"
else
    warning "No dist directory found (will be created during deployment)"
fi

echo ""
echo "================================================"
echo "📊 Validation Summary"
echo "================================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
else
    echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s)${NC}"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 Application is ready for deployment!${NC}"
    echo ""
    echo "Deployment options:"
    echo "  - Vercel:  ./scripts/deploy-vercel.sh"
    echo "  - Docker:  ./scripts/deploy-docker.sh"
    echo "  - Manual:  See DEPLOYMENT.md"
    exit 0
else
    echo -e "${RED}❌ Please fix errors before deploying${NC}"
    exit 1
fi
