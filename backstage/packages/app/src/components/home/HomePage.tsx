import React from 'react';
import { Grid, Typography, Box, CircularProgress, Paper } from '@material-ui/core';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import {
  HomePageCompanyLogo,
  HomePageStarredEntities,
  HomePageRandomJoke,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { FlightOpsWidget } from './widgets/FlightOpsWidget';
import { CostDashboard } from './widgets/CostDashboard';
import { TeamActivity } from './widgets/TeamActivity';
import { SecurityAlerts } from './widgets/SecurityAlerts';
import { SystemHealth } from './widgets/SystemHealth';
import { WorldClock } from './widgets/WorldClock';
import { LiveCatalogServices } from './widgets/LiveCatalogServices';
import { HomePageMarkdown } from '@roadiehq/backstage-plugin-home-markdown';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import { DashboardSelector } from './DashboardSelector';
import { DashboardCards } from './DashboardCards';

const getWelcomeContent = (dashboardId?: string) => {
  switch (dashboardId) {
    case 'ba-security':
      return `
# 🔒 BA Security Operations Center

**Your command center for security monitoring and compliance**

- 🛡️ **Threat Detection**: Real-time security alerts and monitoring
- 🔍 **Vulnerability Management**: Scan results and remediation tracking  
- 📋 **Compliance**: Regulatory compliance status and audits
- 🔐 **Access Control**: Identity and access management oversight
- 📊 **Security Metrics**: Risk assessment and security KPIs

---
*"Security first, always vigilant."* - BA Security Team
`;

    case 'ba-platform':
      return `
# ⚙️ BA Platform Engineering Hub

**Infrastructure and platform operations command center**

- 🏗️ **Infrastructure**: Cloud resources and cluster management
- 🚀 **Deployments**: CI/CD pipelines and release management
- 📊 **Monitoring**: System health and performance metrics
- 🔧 **Automation**: Infrastructure as Code and automation tools
- 🏢 **Multi-Cloud**: AWS, Azure, and GCP resource management

---
*"Building the foundation for digital aviation."* - BA Platform Team
`;

    case 'ba-management':
      return `
# 📊 BA Executive Dashboard

**Strategic overview and business intelligence**

- 💰 **Cost Management**: IT spend and budget optimization
- 📈 **Performance Metrics**: Business KPIs and operational metrics
- 🎯 **Strategic Initiatives**: Progress on key business objectives
- 👥 **Team Performance**: Development velocity and delivery metrics
- 📋 **Governance**: Compliance and risk management overview

---
*"Strategic insight drives operational excellence."* - BA Leadership
`;

    case 'ba-developer':
      return `
# 💻 BA Developer Experience

**Your toolkit for efficient software development**

- 🛠️ **Development Tools**: APIs, libraries, and development resources
- 📚 **Documentation**: Technical guides and best practices
- 🧪 **Testing**: Quality assurance and testing frameworks
- 🔄 **CI/CD**: Build pipelines and deployment automation
- 🎨 **Templates**: Service scaffolding and code templates

---
*"Empowering developers to build the future of aviation."* - BA Dev Team
`;

    case 'ba-main':
      return `
Welcome to British Airways Digital Operations Hub! ✈️

Your central command center for monitoring and managing all BA digital infrastructure and services worldwide.

🎯 SPECIALIZED DASHBOARDS
Navigate to the dashboard that matches your role using the cards below:

🚀 Operations - DevOps, deployments, and system automation
⚙️ Engineering - Platform infrastructure and cloud services  
🔒 Security - Security monitoring and compliance oversight
📊 Management - Strategic metrics and business insights
💻 Development - Developer tools and productivity metrics

📊 SYSTEM OVERVIEW
• Real-time system health monitoring
• Complete service catalog with live status
• Global operations timezones
• GitHub activity and project updates
• Quick access to essential tools

🌍 GLOBAL REACH
BA operates across multiple time zones and continents. Use the world clock to coordinate with teams in London, Madrid, New York, Singapore, Mumbai, and more.

✈️ Ready for takeoff? Select your dashboard above and start monitoring BA's digital excellence.

---
"Connecting the world through digital innovation" - BA Operations Team
`;

    default: // ba-devops
      return `
# 🚀 BA DevOps Command Center

**Your central hub for development operations**

- 🚀 **Deployments**: CI/CD pipelines and release status
- 📊 **Monitoring**: Real-time system health and metrics  
- 🔧 **Automation**: Infrastructure automation and tooling
- 📚 **Documentation**: DevOps guides and best practices
- 🔍 **Observability**: Logging, tracing, and alerting

---
*"To fly. To serve. To deploy."* - BA DevOps Team
`;
  }
};

export const HomePage = () => {
  const { 
    config, 
    loading, 
    error, 
    availableTemplates, 
    currentTemplate, 
    switchTemplate 
  } = useDashboardConfig();

  if (loading) {
    return (
      <Page themeId="home">
        <Header title="Loading Dashboard..." subtitle="Fetching configuration from GitHub">
          <HomePageCompanyLogo />
        </Header>
        <Content>
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress size={60} />
            <Box ml={2}>
              <Typography variant="h6">Loading Dashboard Configuration</Typography>
              <Typography variant="body2" color="textSecondary">
                Fetching latest config from GitHub repository...
              </Typography>
            </Box>
          </Box>
        </Content>
      </Page>
    );
  }

  if (!config) {
    return (
      <Page themeId="home">
        <Header title="Configuration Error" subtitle="Unable to load dashboard configuration">
          <HomePageCompanyLogo />
        </Header>
        <Content>
          <Paper style={{ padding: 16, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
            <Box display="flex" alignItems="center">
              <ErrorIcon style={{ color: '#f44336', marginRight: 8 }} />
              <div>
                <Typography variant="h6" style={{ color: '#f44336' }}>
                  Configuration Error
                </Typography>
                <Typography variant="body2">
                  Failed to load dashboard configuration from GitHub repository.
                </Typography>
                {error && (
                  <Typography variant="body2" style={{ marginTop: 8, fontFamily: 'monospace' }}>
                    Error: {error}
                  </Typography>
                )}
              </div>
            </Box>
          </Paper>
        </Content>
      </Page>
    );
  }

  const { metadata, spec } = config;
  const spacing = spec.layout?.grid?.spacing || 3;

  return (
    <Page themeId="home">
      <Header title={metadata.title} subtitle={metadata.subtitle}>
        <HomePageCompanyLogo />
      </Header>
      <Content>
        
        {error && (
          <Paper style={{ padding: 12, marginBottom: 16, backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
            <Box display="flex" alignItems="center">
              <WarningIcon style={{ color: '#ff9800', marginRight: 8 }} />
              <Typography variant="body2">
                <strong>Using fallback configuration.</strong> {error}
              </Typography>
            </Box>
          </Paper>
        )}
        
        <Grid container spacing={spacing}>
          {/* Top Row - Search and Welcome */}
          <Grid item xs={12}>
            <HomePageSearchBar />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <InfoCard title="Welcome to BA Operations">
              <Box p={2}>
                <Typography component="div" style={{ whiteSpace: 'pre-line' }}>
                  {getWelcomeContent('ba-main').replace(/^#\s+.*$/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').trim()}
                </Typography>
              </Box>
            </InfoCard>
          </Grid>
          
          {spec.widgets.worldClock?.enabled && (
            <Grid item xs={12} md={4}>
              <WorldClock />
            </Grid>
          )}

          {/* Dashboard Navigation Cards - Static list */}
          <Grid item xs={12}>
            <InfoCard title="🎯 Navigate to Specialized Dashboards">
              <Box p={2}>
                <DashboardCards
                  dashboards={[
                    {
                      id: 'ba-devops',
                      name: 'BA DevOps Dashboard',
                      icon: '🚀',
                      description: 'Operations monitoring and deployment status',
                      category: 'Operations',
                    },
                    {
                      id: 'ba-platform',
                      name: 'Platform Engineering',
                      icon: '⚙️',
                      description: 'Infrastructure and platform metrics',
                      category: 'Engineering',
                    },
                    {
                      id: 'ba-security',
                      name: 'Security Dashboard',
                      icon: '🔒',
                      description: 'Security alerts and compliance monitoring',
                      category: 'Security',
                    },
                    {
                      id: 'ba-management',
                      name: 'Executive Dashboard',
                      icon: '📊',
                      description: 'High-level metrics and business insights',
                      category: 'Management',
                    },
                    {
                      id: 'ba-developer',
                      name: 'Developer Experience',
                      icon: '💻',
                      description: 'Developer tools and productivity metrics',
                      category: 'Development',
                    },
                  ]}
                  onDashboardSelect={(dashboardId) => {
                    // Simple navigation - just change localStorage and reload
                    localStorage.setItem('selectedDashboard', dashboardId);
                    window.location.reload();
                  }}
                />
              </Box>
            </InfoCard>
          </Grid>

          {/* Flight Operations Row */}
          {spec.widgets.flightOps?.enabled && (
            <Grid item xs={12} lg={8}>
              <FlightOpsWidget />
            </Grid>
          )}
          
          {spec.widgets.security?.enabled && (
            <Grid item xs={12} lg={4}>
              <SecurityAlerts />
            </Grid>
          )}

          {/* System Health and Monitoring Row */}
          {spec.widgets.systemHealth?.enabled && (
            <Grid item xs={12}>
              <SystemHealth />
            </Grid>
          )}

          {/* Cost and Activity Row */}
          {spec.widgets.costDashboard?.enabled && (
            <Grid item xs={12} md={8}>
              <CostDashboard />
            </Grid>
          )}
          
          {spec.widgets.github?.enabled && (
            <Grid item xs={12} md={4}>
              <TeamActivity />
            </Grid>
          )}

          {/* Utilities Row */}
          {spec.widgets.catalog?.enabled && (
            <Grid item xs={12} md={6}>
              <LiveCatalogServices />
            </Grid>
          )}
          
          <Grid item xs={12} md={3}>
            <InfoCard title="Quick Actions">
              <Box p={2}>
                {false ? ( // Simplified - always show main dashboard actions
                  // Security-specific actions
                  <>
                    <Typography variant="body2" gutterBottom>
                      🛡️ <a href="/catalog?filters=tag:security" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Security Services</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🔍 <a href="/catalog?filters=tag:compliance" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Compliance Tools</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📋 <a href="/docs/security" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Security Docs</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🚨 <a href="/alerts" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Security Alerts</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🔐 <a href="/auth-management" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Access Control</a>
                    </Typography>
                    <Typography variant="body2">
                      📊 <a href="/security-metrics" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Risk Dashboard</a>
                    </Typography>
                  </>
                ) : false ? (
                  // Platform-specific actions
                  <>
                    <Typography variant="body2" gutterBottom>
                      🏗️ <a href="/catalog?filters=tag:infrastructure" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Infrastructure</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      ☸️ <a href="/kubernetes" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>K8s Clusters</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🚀 <a href="/deployments" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Deployments</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📊 <a href="/monitoring" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Monitoring</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      ☁️ <a href="/cloud-resources" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Cloud Resources</a>
                    </Typography>
                    <Typography variant="body2">
                      🔧 <a href="/automation" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Automation Tools</a>
                    </Typography>
                  </>
                ) : false ? (
                  // Developer-specific actions
                  <>
                    <Typography variant="body2" gutterBottom>
                      🚀 <a href="/create" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Create Service</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🧪 <a href="/catalog?filters=tag:template" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Code Templates</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📚 <a href="/docs" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Dev Docs</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🔍 <a href="/api-docs" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>API Explorer</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🛠️ <a href="/tools" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Dev Tools</a>
                    </Typography>
                    <Typography variant="body2">
                      🔄 <a href="/ci-cd" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>CI/CD Pipelines</a>
                    </Typography>
                  </>
                ) : true ? ( // Always show main dashboard actions
                  // Main dashboard - General actions only
                  <>
                    <Typography variant="body2" gutterBottom>
                      📊 <a href="/catalog" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Service Catalog</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📚 <a href="/docs" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Documentation</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      🔍 <a href="/search" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Global Search</a>
                    </Typography>
                    <Typography variant="body2">
                      ⚙️ <a href="/settings" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Settings</a>
                    </Typography>
                  </>
                ) : (
                  // Default DevOps/Management actions for other dashboards
                  <>
                    <Typography variant="body2" gutterBottom>
                      🚀 <a href="/create" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Create Service</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📊 <a href="/catalog" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Browse Catalog</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📚 <a href="/docs" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Documentation</a>
                    </Typography>
                    <Typography variant="body2">
                      📈 <a href="/catalog-graph" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>System Graph</a>
                    </Typography>
                  </>
                )}
              </Box>
            </InfoCard>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <HomePageRandomJoke />
          </Grid>

        </Grid>
        
        {/* Configuration Info Footer */}
        <Box mt={3} textAlign="center">
          <Typography variant="caption" color="textSecondary">
            🔄 Auto-refreshes from GitHub every 5 minutes • v{metadata.version}
            {spec.branding?.motto && (
              <Typography variant="caption" display="block" style={{ fontStyle: 'italic', marginTop: 4 }}>
                "{spec.branding.motto}"
              </Typography>
            )}
          </Typography>
        </Box>
      </Content>
    </Page>
  );
};

export const homePage = <HomePage />;