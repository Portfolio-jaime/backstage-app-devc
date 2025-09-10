#!/bin/bash

set -e

echo "🚀 Setting up BA Dashboard Plugin for Backstage..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 Step: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the backstage directory
if [ ! -f "package.json" ] || ! grep -q "backstage-cli" package.json; then
    print_error "Please run this script from the Backstage root directory"
    exit 1
fi

print_step "Installing dashboard dependencies..."

# Install required dependencies for dashboard functionality
yarn add --dev @types/js-yaml
yarn add js-yaml

print_success "Dashboard dependencies installed"

print_step "Ensuring required Backstage plugins are installed..."

# Check if required plugins are already installed
PACKAGES_TO_INSTALL=""

# Check for home plugin
if ! yarn info @backstage/plugin-home > /dev/null 2>&1; then
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL @backstage/plugin-home"
fi

# Check for search plugin
if ! yarn info @backstage/plugin-search > /dev/null 2>&1; then
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL @backstage/plugin-search"
fi

# Check for home-markdown plugin
if ! yarn info @roadiehq/backstage-plugin-home-markdown > /dev/null 2>&1; then
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL @roadiehq/backstage-plugin-home-markdown"
fi

# Check for recharts (for widgets with charts)
if ! yarn info recharts > /dev/null 2>&1; then
    PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL recharts"
fi

if [ ! -z "$PACKAGES_TO_INSTALL" ]; then
    print_step "Installing missing packages: $PACKAGES_TO_INSTALL"
    yarn workspace app add $PACKAGES_TO_INSTALL
    print_success "Missing packages installed"
else
    print_success "All required packages already installed"
fi

print_step "Verifying dashboard hook and components..."

# Check if dashboard hook exists
if [ ! -f "packages/app/src/hooks/useDashboardConfig.ts" ]; then
    print_error "Dashboard hook (useDashboardConfig.ts) not found!"
    print_warning "Please ensure the dashboard configuration hook is properly implemented"
    exit 1
fi

print_success "Dashboard hook found"

# Check if widgets directory exists
if [ ! -d "packages/app/src/components/home/widgets" ]; then
    print_warning "Widgets directory not found, creating it..."
    mkdir -p packages/app/src/components/home/widgets
fi

print_success "Widgets directory verified"

print_step "Checking GitHub configuration repository access..."

# Test if the configuration repository is accessible
GITHUB_CONFIG_URL="https://raw.githubusercontent.com/Portfolio-jaime/backstage-dashboard-templates/main/templates/ba-devops-dashboard/config.yaml"

if curl -f -s "$GITHUB_CONFIG_URL" > /dev/null; then
    print_success "GitHub configuration repository is accessible"
else
    print_warning "GitHub configuration repository might not be accessible"
    print_warning "Make sure the repository is public and contains the configuration file"
fi

print_step "Verifying app-config.yaml dashboard configuration..."

if grep -q "dashboard:" app-config.yaml; then
    print_success "Dashboard configuration found in app-config.yaml"
else
    print_warning "Dashboard configuration not found in app-config.yaml"
    print_warning "Please add the dashboard configuration section"
fi

print_step "Running type check..."

if yarn tsc --noEmit; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    print_warning "Please fix TypeScript errors before proceeding"
    exit 1
fi

print_step "Running linting..."

if yarn lint:all; then
    print_success "Linting passed"
else
    print_warning "Linting issues found, but continuing..."
fi

echo ""
echo -e "${GREEN}🎉 Dashboard setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Make sure your GitHub repository 'backstage-dashboard-templates' is public"
echo "2. Start Backstage with: yarn start"
echo "3. Navigate to the dashboard to see the external configuration in action"
echo ""
echo -e "${YELLOW}📝 Configuration:${NC}"
echo "• External config: $GITHUB_CONFIG_URL"
echo "• Auto-refresh: Every 5 minutes"
echo "• Fallback: Minimal configuration if external fails"
echo ""
echo -e "${BLUE}🔧 To modify dashboard:${NC}"
echo "1. Edit files in the backstage-dashboard-templates repository"
echo "2. Commit and push changes"
echo "3. Changes will appear automatically within 5 minutes"