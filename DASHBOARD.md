# BA DevOps Dashboard - External Configuration System

## 🎯 Overview

The BA DevOps Dashboard now uses **external configuration** from a GitHub repository, enabling GitOps-style management of dashboard settings without requiring Backstage redeployments.

## 📁 Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Dashboard Repo    │    │   Backstage Proxy   │    │   Frontend Hook     │
│  (GitHub Public)    │────│  /api/dashboard-config│────│ useDashboardConfig  │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## 🔧 Configuration Repository

**Repository:** https://github.com/Portfolio-jaime/backstage-dashboard-templates

**Main Config File:** `templates/ba-devops-dashboard/config.yaml`

## 🚀 How It Works

### **Automatic Updates**
- ✅ Dashboard fetches configuration every **5 minutes**
- ✅ No Backstage restart required for config changes
- ✅ Real-time widget enable/disable
- ✅ Theme and layout updates

### **Error Handling**
- ✅ Fallback to minimal configuration if GitHub is unavailable
- ✅ Visual indicators for configuration status
- ✅ Comprehensive error logging in browser console

### **CORS Solution**
- ✅ Uses Backstage proxy (`/api/dashboard-config`) to avoid CORS issues
- ✅ Seamless integration with frontend
- ✅ Works in all environments (local, staging, production)

## 🎛️ Available Widgets

| Widget | Description | Status |
|--------|-------------|---------|
| **GitHub Activity** | Real-time team activity from repositories | ✅ Live Data |
| **Backstage Catalog** | Services from Backstage catalog with health | ✅ Live Data |
| **Flight Operations** | BA flight metrics and operations | 🔄 Mock Data |
| **Cost Dashboard** | Multi-cloud cost management | 🔄 Mock Data |
| **Security Alerts** | Security monitoring and alerts | 🔄 Mock Data |
| **System Health** | Infrastructure health monitoring | 🔄 Mock Data |
| **World Clock** | Global time zones for BA operations | ✅ Live Data |

## 📝 Making Configuration Changes

### **Step 1: Edit Configuration**
```bash
# Clone the dashboard templates repository
git clone https://github.com/Portfolio-jaime/backstage-dashboard-templates.git
cd backstage-dashboard-templates

# Edit the main configuration file
vim templates/ba-devops-dashboard/config.yaml
```

### **Step 2: Commit and Push**
```bash
git add .
git commit -m "feat: update dashboard configuration

- Describe your changes here

Author: Your Name <your.email@ba.com>"
git push origin main
```

### **Step 3: Wait for Auto-Update**
- Changes appear automatically within **5 minutes**
- Check browser console for loading confirmation
- Dashboard shows configuration version in footer

## 🛠️ Development Setup

### **DevContainer (Recommended)**
```bash
# DevContainer automatically sets up dashboard dependencies
# Just reopen in container and run setup script
.devcontainer/setup-course.sh
```

### **Manual Setup**
```bash
# Install dashboard dependencies
yarn setup:dashboard

# Validate external configuration
yarn dashboard:validate
```

## 🔍 Troubleshooting

### **Configuration Not Loading**
1. Check browser console for errors
2. Verify repository is public: https://github.com/Portfolio-jaime/backstage-dashboard-templates
3. Test configuration validation:
   ```bash
   yarn dashboard:validate
   ```

### **Widgets Not Showing**
1. Check widget `enabled: true` in configuration
2. Verify widget dependencies are installed
3. Check browser console for component errors

### **GitHub API Rate Limits**
- GitHub widget uses public API (5000 requests/hour)
- Add GitHub token in .env for higher limits:
  ```
  GITHUB_TOKEN=your_token_here
  ```

## 🔐 Security

### **Configuration Repository**
- ✅ Public repository (no secrets)
- ✅ All sensitive data in environment variables
- ✅ Configuration contains only display settings

### **API Access**
- ✅ Uses Backstage proxy for secure API access
- ✅ No direct external API calls from frontend
- ✅ Rate limiting and error handling

## 📊 Configuration Schema

```yaml
apiVersion: backstage.io/v1
kind: DashboardConfig
metadata:
  name: ba-devops-dashboard
  title: "Your Dashboard Title"
  version: "1.0.0"
spec:
  widgets:
    github:
      enabled: true
      refreshInterval: 300000
      repositories: [...]
    catalog:
      enabled: true
      maxServices: 8
  theme:
    primaryColor: "#1976d2"
    secondaryColor: "#ff9800"
  layout:
    grid:
      columns: 12
      spacing: 3
```

## 🚀 Team Workflow

### **Adding New Widgets**
1. Create widget component in `packages/app/src/components/home/widgets/`
2. Add widget configuration to dashboard repository
3. Update HomePage to include new widget
4. Test and create PR

### **Updating Existing Widgets**
1. Modify configuration in dashboard repository
2. Changes apply automatically within 5 minutes
3. No code deployment required

### **Emergency Changes**
- Disable widgets by setting `enabled: false` in configuration
- Changes take effect within 5 minutes
- Critical fixes can be made without Backstage restart

---

**Documentation Version:** 1.0  
**Last Updated:** January 2025  
**Maintainer:** Jaime Henao - BA DevOps Team  
**Repository:** https://github.com/Portfolio-jaime/backstage-app-devc