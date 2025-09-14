# 🎯 British Airways - Backstage Dashboard System Design Document

**Version**: 2.0
**Date**: January 2025
**Author**: Jaime Henao & Claude Code
**Project**: Multi-Dashboard Backstage Implementation

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Dashboard Specifications](#dashboard-specifications)
4. [Implementation Progress](#implementation-progress)
5. [Technical Components](#technical-components)
6. [Configuration Management](#configuration-management)
7. [Future Roadmap](#future-roadmap)
8. [Team Assignments](#team-assignments)

---

## 🎯 Executive Summary

### Project Vision
Implement a comprehensive multi-dashboard system for British Airways using Backstage.io, providing role-based, team-specific views for different operational units across the organization.

### Key Objectives
- ✅ **Role-Based Access**: Different dashboards for different teams and responsibilities
- ✅ **Dynamic Configuration**: GitOps-style configuration management via GitHub
- ✅ **Real-Time Data**: Live GitHub Activity, Service Catalog, and team metrics
- ✅ **Global Operations**: Multi-timezone support for worldwide BA operations
- ✅ **Team-Specific Content**: Filtered content based on team ownership and responsibilities

### Current Status: **Phase 2 - Individual Dashboard Optimization**
- ✅ Main Dashboard: Complete and polished
- 🚧 DevOps Dashboard: In development (80% complete)
- ⏳ Platform Dashboard: Planned
- ⏳ Security Dashboard: Planned
- ⏳ Management Dashboard: Planned
- ⏳ Developer Dashboard: Planned

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Backstage Frontend                        │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Main        │ │ DevOps      │ │ Platform    │ ...      │
│  │ Dashboard   │ │ Dashboard   │ │ Dashboard   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Shared Components Layer                        │ │
│  │  • useDashboardConfig • useDashboardPermissions        │ │
│  │  • TeamInfoWidget • TechDocsWidget • WorldClock        │ │
│  │  • GitHub Activity • Service Catalog • Metrics         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Configuration Repository                        │
│          (backstage-dashboard-templates)                     │
│                                                             │
│  templates/                                                 │
│  ├── ba-main-dashboard/config.yaml                         │
│  ├── ba-devops-dashboard/config.yaml                       │
│  ├── ba-platform-dashboard/config.yaml                     │
│  ├── ba-security-dashboard/config.yaml                     │
│  ├── ba-management-dashboard/config.yaml                   │
│  ├── ba-developer-dashboard/config.yaml                    │
│  └── registry.yaml (Template Index)                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Configuration Loading**: Dashboards fetch YAML configs from GitHub
2. **Permission Check**: User permissions validated against team membership
3. **Widget Rendering**: Team-specific widgets loaded based on configuration
4. **Real-Time Updates**: Auto-refresh every 5 minutes + manual refresh button
5. **Theme Application**: Dashboard-specific themes applied dynamically

---

## 📊 Dashboard Specifications

### 🏠 Main Dashboard (ba-main)
**Purpose**: Central navigation hub and company overview
**Target Users**: All BA employees
**Status**: ✅ Complete

**Features**:
- 🎯 Dashboard navigation cards with role-based filtering
- 🌍 Global timezone clock (London, Madrid, NYC, Singapore, Buenos Aires, etc.)
- ⚙️ Preferences panel (moved from header)
- 🔗 Quick access links
- 📢 Welcome messages with company branding

**Widgets**:
- ✅ Dashboard Navigation Cards
- ✅ World Clock (Multi-timezone)
- ✅ Quick Actions
- ✅ Preferences Panel
- ✅ Company Welcome Message

---

### 🚀 DevOps Dashboard (ba-devops)
**Purpose**: Development operations and deployment monitoring
**Target Users**: DevOps Engineers, SREs, Platform Engineers
**Status**: 🚧 80% Complete

**Team Information**:
- **Team Lead**: jaime.henao@ba.com
- **Team Members**: jaime.henao, devops1@ba.com, devops2@ba.com
- **Responsibilities**: CI/CD, Infrastructure as Code, Kubernetes, Monitoring
- **Tools**: Kubernetes, Terraform, Jenkins/GitHub Actions, Prometheus/Grafana
- **DORA Metrics**: Multiple deployments/day, <1hr lead time, <30min MTTR, <5% failure rate

**Widgets**:
- ✅ Team Information Widget (DORA metrics, member cards, tools)
- ✅ GitHub Activity Widget (DevOps repos: backstage-app-devc, terraform-infrastructure, kubernetes-manifests)
- ✅ Service Catalog (Infrastructure components, deployment pipelines)
- ✅ TechDocs Widget (Runbooks, infrastructure docs, CI/CD guides)
- ✅ Quick Actions (Deploy, Monitor, Pipelines)
- ✅ Real Metrics Widget

**Repositories Tracked**:
```yaml
- backstage-app-devc
- backstage-dashboard-templates
- kubernetes-manifests
- terraform-infrastructure
- ci-cd-pipelines
- monitoring-stack
- gitops-config
```

---

### ⚙️ Platform Dashboard (ba-platform)
**Purpose**: Platform engineering and infrastructure management
**Target Users**: Platform Engineers, Cloud Architects
**Status**: ⏳ Planned

**Planned Features**:
- 🏗️ Infrastructure health monitoring
- ☁️ Cloud resource utilization
- 🔧 Platform service status
- 📊 Performance metrics
- 🛡️ Security compliance status

---

### 🔒 Security Dashboard (ba-security)
**Purpose**: Security monitoring and compliance oversight
**Target Users**: Security Engineers, CISO, Security Analysts
**Status**: ⏳ Planned

**Planned Features**:
- 🚨 Security alerts and incidents
- 🛡️ Compliance status
- 🔍 Vulnerability scans
- 📋 Security policies
- 📊 Risk metrics

---

### 📊 Management Dashboard (ba-management)
**Purpose**: Executive overview and business metrics
**Target Users**: Executives, Directors, VPs, CTOs
**Status**: ⏳ Planned

**Planned Features**:
- 📈 Business KPIs
- 💰 Cost analytics
- 👥 Team performance
- 🎯 OKR tracking
- 📊 Strategic metrics

---

### 💻 Developer Dashboard (ba-developer)
**Purpose**: Development tools and productivity metrics
**Target Users**: Developers, Tech Leads, Engineering Managers
**Status**: ⏳ Planned

**Planned Features**:
- 🔧 Development tools
- 📊 Code quality metrics
- 🚀 Deployment status
- 📚 Developer documentation
- 🏆 Team productivity

---

## 🛠️ Technical Components

### Core Hooks
```typescript
// Configuration management
useDashboardConfig() - Loads YAML configs from GitHub
useUserPreferences() - User settings and preferences
useDashboardPermissions() - Role-based access control
```

### Widget Library
```typescript
// Shared widgets across dashboards
TeamInfoWidget - Team member information and metrics
TechDocsWidget - Documentation with team filtering
WorldClock - Multi-timezone display
TeamActivity - GitHub activity with repository filtering
LiveCatalogServices - Backstage catalog with team filtering
RealMetricsWidget - Performance and DORA metrics
DailyTipsWidget - Tips and announcements
```

### Permission System
```yaml
# Role-based dashboard access
DevOps Team: ba-devops, ba-platform (read-only)
Platform Team: ba-platform, ba-devops (read-only)
Security Team: ba-security, all others (read-only)
Management: ba-management, all others (read-only)
Developers: ba-developer, ba-devops (limited)
```

### Theme System
```yaml
# Dashboard-specific themes
DevOps:
  - devops-terminal (dark, terminal-inspired)
  - devops-matrix (green matrix theme)
  - devops-classic-light (clean light theme)

Platform:
  - platform-cloud (cloud-inspired blues)
  - platform-industrial (industrial greys)

Security:
  - security-dark (dark red/black)
  - security-light (clean white/red)
```

---

## 📋 Configuration Management

### GitOps Workflow
1. **Configuration Changes**: Edit YAML files in `backstage-dashboard-templates` repo
2. **Auto-Sync**: Dashboards poll GitHub every 5 minutes for changes
3. **Manual Refresh**: Refresh button forces immediate config reload
4. **Version Control**: All changes tracked in Git with full history
5. **Rollback**: Easy rollback to previous configurations via Git

### Configuration Structure
```yaml
# Template: ba-{team}-dashboard/config.yaml
apiVersion: backstage.io/v1
kind: DashboardConfig
metadata:
  name: ba-{team}-dashboard
  title: "BA {Team} Dashboard"
spec:
  team:           # Team-specific information
    name: team-name
    members: [...]
    tools: [...]
    metrics: {...}
  widgets:        # Widget configuration
    github:
      enabled: true
      filters: {...}
    catalog:
      enabled: true
      teamFilter: team-name
    techdocs:
      enabled: true
      filters: {...}
  theme:          # Theme options
    availableThemes: [...]
  content:        # Dashboard content
    quickActions: [...]
    welcomeMessage: "..."
```

---

## 📈 Implementation Progress

### Phase 1: Foundation (✅ Complete)
- ✅ Multi-repository architecture setup
- ✅ GitOps configuration system
- ✅ Permission and access control
- ✅ Main dashboard as navigation hub
- ✅ Refresh functionality across all dashboards
- ✅ Theme system foundation

### Phase 2: Individual Dashboard Development (🚧 Current)
- ✅ **Main Dashboard**: Complete with navigation and preferences
- 🚧 **DevOps Dashboard**: 80% complete
  - ✅ Team information widget
  - ✅ GitHub activity (team-filtered)
  - ✅ Service catalog (infrastructure focus)
  - ✅ TechDocs widget with documentation
  - ✅ Refresh functionality
  - ⏳ Final testing and optimization
- ⏳ **Platform Dashboard**: Design phase
- ⏳ **Security Dashboard**: Planning phase
- ⏳ **Management Dashboard**: Requirements gathering
- ⏳ **Developer Dashboard**: Wireframe phase

### Phase 3: Integration & Optimization (⏳ Upcoming)
- Environment-specific dashboards (PROD1, SIT1, DEV1, PCM, UAT1)
- Advanced team metrics and DORA metrics
- Cross-dashboard notifications
- Advanced theming and customization
- Performance optimization
- Mobile responsiveness

### Phase 4: Advanced Features (⏳ Future)
- Real-time notifications
- Dashboard personalization
- Advanced analytics
- Integration with BA systems
- AI-powered insights
- Multi-language support

---

## 👥 Team Assignments

### Current Team Structure

**DevOps Team** (`devops-team`)
- **Lead**: Jaime Henao (jaime.henao@ba.com)
- **Members**: devops1@ba.com, devops2@ba.com
- **Dashboard**: ba-devops
- **Focus**: CI/CD, Infrastructure, Kubernetes, Monitoring

**Platform Team** (`platform-team`)
- **Dashboard**: ba-platform (planned)
- **Focus**: Cloud infrastructure, Platform services

**Security Team** (`security-team`)
- **Dashboard**: ba-security (planned)
- **Focus**: Security monitoring, Compliance

**Management** (`leadership-team`)
- **Dashboard**: ba-management (planned)
- **Focus**: Business metrics, Strategic overview

**Developers** (`development-team`)
- **Dashboard**: ba-developer (planned)
- **Focus**: Code quality, Development tools

---

## 🚀 Next Steps & Roadmap

### Immediate (Week 1-2)
1. **Complete DevOps Dashboard**
   - Final testing and bug fixes
   - Performance optimization
   - User acceptance testing

2. **Start Platform Dashboard**
   - Requirements gathering
   - Widget design and planning
   - Team information setup

### Short Term (Week 3-4)
3. **Platform Dashboard Development**
   - Infrastructure monitoring widgets
   - Cloud resource utilization
   - Platform service status

4. **Security Dashboard Planning**
   - Security team requirements
   - Compliance widget design
   - Alert integration planning

### Medium Term (Month 2)
5. **Security Dashboard Development**
6. **Management Dashboard Planning**
7. **Environment-specific dashboards**

### Long Term (Month 3+)
8. **Developer Dashboard Development**
9. **Advanced features implementation**
10. **Mobile optimization**
11. **Performance analytics**

---

## 🎨 Design Principles

### User Experience
- **Role-Based**: Each dashboard tailored to specific roles and responsibilities
- **Clean & Minimal**: Focus on relevant information, remove noise
- **Responsive**: Works across desktop, tablet, and mobile
- **Fast Loading**: Optimized for quick dashboard switching
- **Intuitive Navigation**: Easy movement between dashboards

### Technical Excellence
- **GitOps**: Configuration as code with version control
- **Modular**: Reusable components across dashboards
- **Performant**: Efficient data loading and rendering
- **Scalable**: Easy to add new dashboards and widgets
- **Maintainable**: Clear code structure and documentation

### BA Branding
- **Consistent**: BA colors, logos, and styling
- **Professional**: Enterprise-grade appearance
- **Global**: Multi-timezone and international support
- **Accessible**: WCAG compliant design

---

## 📊 Success Metrics

### User Adoption
- Dashboard usage frequency
- User session duration
- Feature utilization rates
- User satisfaction scores

### Technical Performance
- Page load times (<2s)
- Widget refresh rates
- Error rates (<1%)
- Uptime (>99.9%)

### Business Impact
- Improved team efficiency
- Faster incident response
- Better visibility into operations
- Reduced context switching

---

## 📝 Notes & Considerations

### Current Challenges
1. **Widget Performance**: Some widgets load slowly with large datasets
2. **Theme Consistency**: Ensuring consistent theming across all dashboards
3. **Permission Complexity**: Managing complex role-based permissions
4. **Data Freshness**: Balancing real-time updates with performance

### Solutions in Progress
1. **Lazy Loading**: Implementing progressive widget loading
2. **Theme Standardization**: Creating design system
3. **Permission Simplification**: Streamlining role definitions
4. **Smart Caching**: Intelligent data caching strategies

---

## 🔗 Links & Resources

### Repositories
- **Frontend**: `backstage-app-devc` - Main Backstage application
- **Configuration**: `backstage-dashboard-templates` - Dashboard configurations
- **Documentation**: This document and inline code documentation

### Key Files
- **HomePage**: `src/components/home/HomePage.tsx` - Main dashboard component
- **Dashboard Config Hook**: `src/hooks/useDashboardConfig.ts` - Configuration management
- **Permissions Hook**: `src/hooks/useDashboardPermissions.ts` - Access control
- **Widget Library**: `src/components/home/widgets/` - Reusable widget components

### External Dependencies
- **Backstage Core**: @backstage/core-components
- **Material-UI**: UI component library
- **js-yaml**: YAML parsing for configuration
- **GitHub API**: Repository and activity data

---

**Document Status**: 🟢 Active
**Last Updated**: January 15, 2025
**Next Review**: Weekly during Phase 2 development

---

*This document serves as the single source of truth for the BA Dashboard System implementation. All team members should reference this document for current status, technical specifications, and roadmap information.*