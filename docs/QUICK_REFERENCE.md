# 🚀 Quick Reference Guide

## ⚡ Quick Start Commands

```bash
# 1. Open in DevContainer
code backstage-app-devc
# Command Palette → "Dev Containers: Reopen in Container"

# 2. Setup environment
cd backstage
export $(cat .env | xargs) 2>/dev/null

# 3. Start application
yarn start

# 4. Access URLs
# Frontend: http://localhost:3001
# Backend:  http://localhost:7008
```

## 📊 Configuration Summary

### ✅ Aligned Configuration Status

| Component | Setting | Value | Status |
|-----------|---------|-------|---------|
| **Frontend** | app.baseUrl | `http://localhost:3001` | ✅ |
| **Frontend** | cors.origin | `http://localhost:3001` | ✅ |
| **Backend** | backend.baseUrl | `http://localhost:7008` | ✅ |
| **Backend** | listen.port | `7008` | ✅ |
| **DevContainer** | forwardPorts | `[3001, 7008, 5433]` | ✅ |
| **Database** | External Port | `5433` | ✅ |
| **Auth** | GitHub OAuth | Configured | ✅ |

## 🏗️ Architecture Overview

```
┌─ Developer Machine ─────────────────────────────┐
│  VS Code + Browser                              │
│  ↓ Port Forwarding                              │
│ ┌─ DevContainer ─────────────────────────────┐  │
│ │  Frontend (3001) ↔ Backend (7008)          │  │
│ │       ↓                ↓                   │  │
│ │  React UI         PostgreSQL (5432)        │  │
│ │                        ↓                   │  │
│ │              GitHub OAuth + API            │  │
│ └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 🔗 Essential URLs

### Development Access
```
Frontend:     http://localhost:3001
Backend API:  http://localhost:7008
Database:     localhost:5433
Health Check: http://localhost:7008/api/catalog/entities
```

### Authentication URLs
```
GitHub Auth:  http://localhost:7008/api/auth/github/start?env=development
Full OAuth:   http://localhost:7008/api/auth/github/start?scope=read%3Auser&origin=http%3A%2F%2Flocalhost%3A3001&flow=popup&env=development
```

## 📁 Project Structure

```
backstage-app-devc/
├── .devcontainer/
│   ├── devcontainer.json     # Port: 3001, 7008, 5433
│   └── docker-compose.yml    # Multi-service setup
├── backstage/
│   ├── app-config.yaml       # Main config (ports aligned)
│   ├── .env                  # Environment variables
│   └── packages/             # Frontend + Backend
├── docs/                     # Complete documentation
└── README.md                 # Project overview
```

## ⚙️ Key Configuration Files

### DevContainer Ports
```json
"forwardPorts": [3001, 7008, 5433, 8083]
```

### Backstage Ports
```yaml
# app-config.yaml
app:
  baseUrl: http://localhost:3001
backend:
  baseUrl: http://localhost:7008
  listen:
    port: 7008
  cors:
    origin: http://localhost:3001
```

### Environment Variables
```bash
NODE_ENV=development
AUTH_GITHUB_CLIENT_ID=Ov23liLt4lvmXKl8nS8M
AUTH_GITHUB_CLIENT_SECRET=1718e24d1dadccb7507c4dd1aba4138074c09b7c
GITHUB_TOKEN='token github'
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

## 🧪 Testing Commands

### Basic Connectivity
```bash
# Frontend
curl http://localhost:3001

# Backend
curl http://localhost:7008/api/catalog/entities

# Authentication
curl "http://localhost:7008/api/auth/github/start?env=development"

# Database
docker exec backstage-postgres pg_isready -U backstage
```

### Full OAuth Test
```bash
curl "http://localhost:7008/api/auth/github/start?scope=read%3Auser&origin=http%3A%2F%2Flocalhost%3A3001&flow=popup&env=development"
```

## 🔧 Troubleshooting Quick Fixes

### Port Issues
```bash
# Check what's running
netstat -tlnp | grep -E ":300[01]|:700[78]"

# Check VS Code Ports tab
# Add ports manually: 3001, 7008, 5433
```

### Auth Provider Issues
```bash
# Check environment
echo $NODE_ENV  # Must be 'development'
export NODE_ENV=development

# Restart with proper env
export $(cat .env | xargs) 2>/dev/null
yarn start
```

### DevContainer Issues
```bash
# Rebuild container
# Command Palette → "Dev Containers: Rebuild Container"

# Check port forwarding in VS Code Ports tab
```

## 🎓 Course Features

### Available Plugins
- **Catalog**: Entity management
- **Scaffolder**: Template system
- **TechDocs**: Documentation
- **Auth**: GitHub OAuth
- **Search**: Full-text search
- **Kubernetes**: Resource view

### Sample URLs After Login
```
Catalog:     http://localhost:3001/catalog
Templates:   http://localhost:3001/create
Docs:        http://localhost:3001/docs
APIs:        http://localhost:3001/api-docs
```

## 📋 Verification Checklist

### ✅ Setup Complete When:
- [ ] DevContainer opens successfully
- [ ] `yarn start` runs without errors
- [ ] Frontend loads at http://localhost:3001
- [ ] Backend responds at http://localhost:7008
- [ ] GitHub auth redirect works
- [ ] Can log in with GitHub
- [ ] Catalog shows entities
- [ ] Templates are available

### 🔍 Debug Checklist
- [ ] VS Code has Dev Containers extension
- [ ] Docker Desktop is running (4GB+ RAM)
- [ ] Ports 3001, 7008, 5433 are forwarded
- [ ] Environment variables are set
- [ ] GitHub OAuth app configured correctly
- [ ] Node.js dependencies installed

## 📞 Support

**Instructor**: Jaime Henao  
**Email**: jaime.andres.henao.arbelaez@ba.com  
**Role**: DevOps Engineer - British Airways  

## 📚 Documentation Index

1. **[COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md)** - Complete setup and usage
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture details  
3. **[DEVCONTAINER_GUIDE.md](./DEVCONTAINER_GUIDE.md)** - DevContainer configuration
4. **[BACKSTAGE_GUIDE.md](./BACKSTAGE_GUIDE.md)** - Backstage configuration
5. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - This document

---

**Quick Reference Version**: 1.0  
**Last Updated**: September 2024  
**Status**: ✅ All configurations aligned and tested