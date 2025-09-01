# 🚀 Backstage DevContainer - Quick Start Guide

## Prerequisites
- VS Code with Dev Containers extension
- Docker Desktop running
- Git

## 1-Minute Setup

### Step 1: Open in DevContainer
```bash
# Clone repository
git clone <repository-url>
cd backstage-app-devc

# Open in VS Code
code .

# Press Cmd+Shift+P → "Dev Containers: Reopen in Container"
```

### Step 2: Setup Environment (Inside DevContainer)
```bash
# Run setup script
.devcontainer/setup-course.sh

# Navigate to Backstage
cd backstage

# Install dependencies
yarn install
```

### Step 3: Start Backstage
```bash
# Start development server
yarn dev
```

### Step 4: Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:7008
- **Database**: localhost:5433

## Configuration Status

After setup, verify your configuration:

```bash
# Check environment variables
env | grep -E "(GITHUB|POSTGRES|BACKEND)"

# Test database connection
pg_isready -h postgres -p 5432 -U backstage

# Test GitHub integration
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

## Next Steps

1. **Login**: Use GitHub OAuth at http://localhost:3001
2. **Browse Catalog**: Explore pre-configured entities
3. **Create Service**: Use scaffolder templates
4. **Add Documentation**: Configure TechDocs

## Troubleshooting

### DevContainer Won't Start
```bash
# Check Docker Desktop is running
docker ps

# Rebuild container
# Cmd+Shift+P → "Dev Containers: Rebuild Container"
```

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3001
lsof -i :7008
lsof -i :5433
```

### GitHub Authentication Issues
1. Verify token at https://github.com/settings/tokens
2. Check OAuth app at https://github.com/settings/applications
3. Ensure callback URL: `http://localhost:7008/api/auth/github/handler/frame`

## Development Commands

```bash
# Install new dependency
yarn workspace @example/app add <package>

# Run tests
yarn test

# Build application
yarn build

# Lint code
yarn lint

# Format code
yarn prettier:check
```

---
**Need Help?** See [DEVCONTAINER_SETUP.md](./DEVCONTAINER_SETUP.md) for detailed documentation.