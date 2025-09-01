#!/bin/bash

# Generate Secrets Script for Backstage Course
# Author: Jaime Henao <jaime.andres.henao.arbelaez@ba.com>

set -e

echo "🔐 Generating secure secrets for Backstage Course..."

# Generate a secure backend secret (32 characters)
BACKEND_SECRET=$(openssl rand -hex 32)

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Update .env file with generated secret
sed -i.bak "s/BACKEND_SECRET=.*/BACKEND_SECRET=${BACKEND_SECRET}/" .env

echo "✅ Backend secret generated and updated in .env"
echo ""
echo "🔑 Your new backend secret is: ${BACKEND_SECRET}"
echo ""
echo "📝 Don't forget to:"
echo "   1. Set your GITHUB_TOKEN in .env"
echo "   2. Verify your GitHub OAuth app settings"
echo "   3. Never commit .env to version control"
echo ""
echo "🚀 Ready to start Backstage with: docker-compose up -d"