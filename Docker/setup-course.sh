#!/bin/bash

# Backstage Course Setup Script
# Author: Jaime Henao <jaime.andres.henao.arbelaez@ba.com>

set -e

echo "🎓 Setting up Backstage DevOps Course Environment"
echo "================================================="
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed"
    exit 1
fi

echo "✅ Docker and Docker Compose are available"
echo ""

# Generate secrets if needed
if grep -q "your-backend-secret-key-here" .env 2>/dev/null; then
    echo "🔐 Generating secure secrets..."
    ./generate-secrets.sh
else
    echo "✅ Secrets already configured"
fi

# Verify GitHub token
if grep -q "your_github_token_here" .env; then
    echo ""
    echo "⚠️  IMPORTANT: You need to set your GITHUB_TOKEN in .env"
    echo "   1. Go to https://github.com/settings/tokens"
    echo "   2. Create a new token with 'repo' and 'read:org' scopes"
    echo "   3. Replace 'your_github_token_here' in .env with your token"
    echo ""
    read -p "Press Enter when you've updated the GitHub token..."
fi

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p ../backstage/data
mkdir -p ../docs/course

echo "✅ Environment setup complete!"
echo ""
echo "🚀 To start the course environment:"
echo "   docker-compose up -d"
echo ""
echo "🌐 Access URLs:"
echo "   • Backstage UI: http://localhost:3000"
echo "   • Backstage API: http://localhost:7007"
echo "   • PostgreSQL: localhost:5432"
echo ""
echo "📚 Course Documentation:"
echo "   • Architecture: http://localhost:3000/docs/default/system/course/"
echo "   • Troubleshooting: http://localhost:3000/docs/default/system/troubleshooting/"
echo ""