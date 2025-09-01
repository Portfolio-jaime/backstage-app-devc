# 🐳 DevContainer Setup Guide

## Overview

This guide details the DevContainer configuration for the Backstage DevOps Course, providing a consistent development environment across all platforms.

## DevContainer Configuration

### File Structure
```
.devcontainer/
├── devcontainer.json          # Main DevContainer configuration
├── docker-compose.yml         # Multi-service orchestration
├── Dockerfile                 # Custom container definition (if needed)
└── setup-course.sh           # Post-creation setup script
```

### Main Configuration (`devcontainer.json`)

```json
{
  "name": "Backstage DevOps Course - British Airways",
  "dockerComposeFile": "docker-compose.yml",
  "service": "backstage-app",
  "workspaceFolder": "/app",
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "redhat.vscode-yaml",
        "ms-python.python",
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "GitHub.vscode-github-actions",
        "ms-azuretools.vscode-docker",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense",
        "ms-vscode.vscode-eslint"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash",
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "typescript.preferences.includePackageJsonAutoImports": "auto"
      }
    }
  },

  "forwardPorts": [3001, 7008, 5433, 8083],
  "portsAttributes": {
    "3001": {
      "label": "Backstage Frontend",
      "onAutoForward": "notify"
    },
    "7008": {
      "label": "Backstage Backend API",
      "onAutoForward": "notify"
    },
    "5433": {
      "label": "PostgreSQL Database",
      "onAutoForward": "silent"
    }
  },

  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/kubectl-helm-minikube:1": {
      "version": "latest",
      "helm": "latest",
      "minikube": "none"
    }
  },

  "postCreateCommand": "echo 'DevContainer initialized!' && .devcontainer/setup-course.sh",
  "remoteUser": "node",
  "containerEnv": {
    "NODE_ENV": "development",
    "CHOKIDAR_USEPOLLING": "true"
  },
  
  "mounts": [
    "source=${localWorkspaceFolder}/.env,target=/app/.env,type=bind,consistency=cached"
  ]
}
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  backstage-app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ../:/app:cached
      - node_modules:/app/backstage/node_modules
    working_dir: /app
    command: sleep infinity
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
    ports:
      - "3001:3001"
      - "7008:7008"
    depends_on:
      - postgres
    networks:
      - backstage-network

  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: backstage
      POSTGRES_PASSWORD: backstage_password
      POSTGRES_DB: backstage
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backstage-network

volumes:
  node_modules:
  postgres_data:

networks:
  backstage-network:
    driver: bridge
```

## Setup Instructions

### 1. Prerequisites
- **VS Code** with Dev Containers extension installed
- **Docker Desktop** running with at least 4GB RAM
- **Git** configured with your credentials

### 2. Initial Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd backstage-app-devc

# Open in VS Code
code .

# Open DevContainer
# Command Palette (Cmd/Ctrl+Shift+P) → "Dev Containers: Reopen in Container"
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your GitHub credentials
nano .env

# Required variables:
# AUTH_GITHUB_CLIENT_ID=your_client_id
# AUTH_GITHUB_CLIENT_SECRET=your_client_secret
# GITHUB_TOKEN=your_personal_access_token
```

### 4. Application Setup
```bash
# Navigate to backstage directory
cd backstage

# Install dependencies
yarn install

# Start development server
yarn start
```

## DevContainer Features

### VS Code Extensions
| Extension | Purpose |
|-----------|---------|
| **TypeScript** | Language support and IntelliSense |
| **Prettier** | Code formatting |
| **ESLint** | Code linting |
| **YAML** | Configuration file support |
| **Docker** | Container management |
| **Kubernetes** | K8s resource management |
| **GitHub Actions** | CI/CD workflow support |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 22.x | JavaScript runtime |
| **Yarn** | 4.4.1 | Package manager |
| **Git** | Latest | Version control |
| **GitHub CLI** | Latest | GitHub integration |
| **kubectl** | Latest | Kubernetes CLI |
| **Helm** | Latest | Kubernetes package manager |

### Port Forwarding
| Port | Service | Description |
|------|---------|-------------|
| **3001** | Frontend | React application |
| **7008** | Backend | Node.js API server |
| **5433** | Database | PostgreSQL (external) |
| **8083** | Additional | Reserved for extensions |

## Customization

### Adding Extensions
```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "existing.extensions",
        "new-extension-id"
      ]
    }
  }
}
```

### Environment Variables
```json
{
  "containerEnv": {
    "NODE_ENV": "development",
    "CUSTOM_VAR": "value"
  }
}
```

### Additional Features
```json
{
  "features": {
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.11"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Port Forwarding Not Working
```bash
# Check VS Code Ports tab
# Manually add ports if not visible
# Restart DevContainer if needed
```

#### 2. Node Modules Issues
```bash
# Clear node_modules volume
docker volume rm backstage-app-devc_node_modules
# Rebuild container
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R node:node /app
```

#### 4. Database Connection Issues
```bash
# Check PostgreSQL container
docker-compose ps
# Restart database
docker-compose restart postgres
```

### Debug Commands
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backstage-app
docker-compose logs postgres

# Access container shell
docker exec -it backstage-app bash

# Check network connectivity
docker network ls
docker network inspect backstage-app-devc_backstage-network
```

## Performance Optimization

### Resource Allocation
```json
{
  "runArgs": [
    "--memory=4g",
    "--cpus=2"
  ]
}
```

### Volume Optimization
```yaml
volumes:
  - ../:/app:cached              # Cached for better performance
  - node_modules:/app/backstage/node_modules  # Named volume
```

### File Watching
```json
{
  "containerEnv": {
    "CHOKIDAR_USEPOLLING": "true"  # Better file watching in containers
  }
}
```

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use secrets management in production
- Rotate GitHub tokens regularly

### Container Security
- Use non-root user (`node`)
- Limit container capabilities
- Scan images for vulnerabilities

### Network Security
- Restrict port access
- Use internal networks
- Enable SSL/TLS in production

## Advanced Configuration

### Multi-Stage Build
```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
```

### Health Checks
```yaml
services:
  backstage-app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7008/healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Best Practices

### 1. Container Lifecycle
- Use `postCreateCommand` for setup
- Implement proper shutdown handling
- Use health checks for reliability

### 2. Development Workflow
- Keep containers lightweight
- Use volume mounts for code
- Implement hot reloading

### 3. Resource Management
- Limit container resources
- Use named volumes for data
- Clean up unused containers

### 4. Security
- Use official base images
- Keep images updated
- Scan for vulnerabilities

---

**Guide Version**: 1.0  
**Last Updated**: September 2024  
**Created by**: Jaime Henao - DevOps Engineer, British Airways