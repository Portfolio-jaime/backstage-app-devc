#!/bin/bash

# Backstage DevContainer Course Setup Script
# Author: Jaime Henao <jaime.andres.henao.arbelaez@ba.com>

set -e

echo "🎓 Setting up Backstage DevOps Course Environment (DevContainer)"
echo "================================================================"
echo ""

# Check if we're inside a DevContainer
if [ -f "/tmp/.X11-unix" ] || [ -n "$REMOTE_CONTAINERS" ] || [ -n "$CODESPACES" ] || [ -f "/.dockerenv" ]; then
    echo "✅ Running inside DevContainer - Docker services managed externally"
    DEVCONTAINER_MODE=true
elif command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker and Docker Compose are available"
    DEVCONTAINER_MODE=false
else
    echo "⚠️  This appears to be a local environment without Docker"
    echo "   For DevContainer: Reopen in VS Code DevContainer"
    echo "   For local setup: Install Docker Desktop first"
    DEVCONTAINER_MODE=false
fi

echo ""

# Generate secrets if needed
if grep -q "your-backend-secret-key-here" .env 2>/dev/null; then
    echo "🔐 Generating secure secrets..."
    ./generate-secrets.sh
else
    echo "✅ Secrets already configured"
fi

# Verify GitHub token
if grep -q "your_github" .env 2>/dev/null; then
    echo ""
    echo "⚠️  IMPORTANT: You need to set your GITHUB_TOKEN in .env"
    echo "   1. Go to https://github.com/settings/tokens"
    echo "   2. Create a new token with 'repo' and 'read:org' scopes"
    echo "   3. Replace placeholder values in .env with your actual tokens"
    echo ""
    if [ "$DEVCONTAINER_MODE" = true ]; then
        echo "   Note: In DevContainer mode, you can continue without GitHub setup for basic functionality"
        read -p "Press Enter to continue..."
    else
        read -p "Press Enter when you've updated the GitHub token..."
    fi
else
    echo "✅ GitHub credentials configured"
fi

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p /app/backstage/data
mkdir -p /app/docs/course

# Set proper permissions in DevContainer
if [ "$DEVCONTAINER_MODE" = true ]; then
    echo "📋 Setting up DevContainer environment..."
    # Ensure node user owns the app directory
    sudo chown -R node:node /app 2>/dev/null || true
    # Instala dependencias del proyecto y el módulo de scaffolder backend para integración con GitHub
    # Esto permite que Backstage pueda crear repositorios y scaffolds usando GitHub desde el backend
    cd /app/backstage
    yarn install
    yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-github
    
    # Setup BA Dashboard Plugin
    echo "🎛️  Setting up BA Dashboard Plugin..."
    
    # Install YAML parsing dependencies
    yarn add js-yaml
    yarn add --dev @types/js-yaml
    
    # Ensure dashboard dependencies are installed
    yarn workspace app add @backstage/plugin-home @backstage/plugin-search @roadiehq/backstage-plugin-home-markdown recharts || echo "Some dependencies might already exist"
    
    # Verify GitHub dashboard repository access
    echo "🔍 Verifying dashboard repository access..."
    DASHBOARD_CONFIG_URL="https://raw.githubusercontent.com/Portfolio-jaime/backstage-dashboard-templates/main/templates/ba-devops-dashboard/config.yaml"
    if curl -f -s "$DASHBOARD_CONFIG_URL" > /dev/null; then
        echo "✅ Dashboard repository is accessible"
    else
        echo "⚠️  Dashboard repository might not be accessible or public"
        echo "   Make sure https://github.com/Portfolio-jaime/backstage-dashboard-templates is public"
    fi
    
    # Run dashboard setup script if it exists
    if [ -f "./scripts/setup-dashboard.sh" ]; then
        echo "🚀 Running dashboard setup..."
        ./scripts/setup-dashboard.sh
    else
        echo "✅ Dashboard setup script not found (manual setup required)"
    fi

    # Inicializa .gitconfig si no existe en el volumen persistente
    if [ ! -f /home/node/.gitconfig ]; then
        echo "📝 Inicializando configuración global de Git (.gitconfig) en el contenedor..."
        cp /app/.devcontainer/gitconfig.template /home/node/.gitconfig
        sudo chown node:node /home/node/.gitconfig 2>/dev/null || true
    else
        echo "✅ .gitconfig ya existe y es persistente."
    fi
fi

echo "✅ Environment setup complete!"
echo ""
echo "🚀 To start Backstage application:"
echo "   cd /app/backstage"
echo "   yarn install"
echo "   yarn dev"
echo ""
echo "🌐 Access URLs (DevContainer ports):"
echo "   • Backstage UI: http://localhost:3001"
echo "   • Backstage API: http://localhost:7008"
echo "   • PostgreSQL: localhost:5433"
echo ""
echo "📚 Course Documentation:"
echo "   • Architecture: http://localhost:3001/docs/default/system/course/"
echo "   • Troubleshooting: http://localhost:3001/docs/default/system/troubleshooting/"
echo ""
echo "🎛️  Dashboard Configuration:"
echo "   • External Config: GitHub backstage-dashboard-templates repository"
echo "   • Auto-refresh: Every 5 minutes"
echo "   • Manual setup: yarn setup:dashboard"
echo "   • Validate config: yarn dashboard:validate"
echo ""