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

// Fallback welcome content if YAML doesn't have content
const getWelcomeContent = (dashboardId?: string) => {
  return `
Welcome to BA Operations Dashboard

This dashboard is loading its content from the GitHub configuration repository.
If you see this message, the dynamic content system is not working properly.

Please check the dashboard configuration in the backstage-dashboard-templates repository.

---
BA Digital Operations Team
`;
};


export const HomePage = () => {
  // Back to dynamic system from GitHub
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
            <InfoCard title={`Welcome to ${metadata.title}`}>
              <Box p={2}>
                <Typography component="div" style={{ whiteSpace: 'pre-line' }}>
                  {config?.content?.welcomeMessage || getWelcomeContent(currentTemplate?.id).replace(/^#\s+.*$/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').trim()}
                </Typography>
                {currentTemplate && currentTemplate.id !== 'ba-main' && (
                  <Box mt={2} p={2} style={{ backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Current Dashboard:</strong> {currentTemplate.name} ({currentTemplate.category})
                    </Typography>
                  </Box>
                )}
              </Box>
            </InfoCard>
          </Grid>
          
          {spec.widgets.worldClock?.enabled && (
            <Grid item xs={12} md={4}>
              <WorldClock />
            </Grid>
          )}

          {/* Dashboard Navigation Cards - Only show on main dashboard */}
          {(currentTemplate?.id === 'ba-main' || currentTemplate?.id?.includes('main')) && (
            <Grid item xs={12}>
              <InfoCard title="🎯 Navigate to Specialized Dashboards">
                <Box p={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Debug: Showing {availableTemplates.filter(t => !t.id.includes('main')).length} specialized dashboards
                  </Typography>
                  <DashboardCards
                    dashboards={availableTemplates.filter(t => !t.id.includes('main')).map(template => ({
                      id: template.id,
                      name: template.name,
                      icon: template.icon || '📊',
                      description: template.description,
                      category: template.category,
                    }))}
                    onDashboardSelect={switchTemplate}
                  />
                </Box>
              </InfoCard>
            </Grid>
          )}

          {/* Dashboard Selector - Show on specialized dashboards */}
          {currentTemplate?.id !== 'ba-main' && (
            <Grid item xs={12}>
              <InfoCard title={`${currentTemplate?.icon || '📊'} ${currentTemplate?.name || 'Dashboard'}`}>
                <Box p={1} display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Currently viewing: {currentTemplate?.category} Dashboard
                  </Typography>
                  <DashboardSelector
                    currentTemplate={currentTemplate}
                    availableTemplates={availableTemplates}
                    onTemplateChange={switchTemplate}
                  />
                </Box>
              </InfoCard>
            </Grid>
          )}

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
                {config?.content?.quickActions && config.content.quickActions.length > 0 ? (
                  // Dynamic quick actions from YAML
                  config.content.quickActions.map((action, index) => (
                    <Typography key={index} variant="body2" gutterBottom={index < config.content.quickActions!.length - 1}>
                      {action.icon} <a href={action.url} style={{ textDecoration: 'none', color: config.spec.theme?.primaryColor || '#1976d2' }}>{action.title}</a>
                    </Typography>
                  ))
                ) : (
                  // Fallback if no quickActions in YAML
                  <>
                    <Typography variant="body2" gutterBottom>
                      📊 <a href="/catalog" style={{ textDecoration: 'none', color: config.spec.theme?.primaryColor || '#1976d2' }}>Service Catalog</a>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      📚 <a href="/docs" style={{ textDecoration: 'none', color: config.spec.theme?.primaryColor || '#1976d2' }}>Documentation</a>
                    </Typography>
                    <Typography variant="body2">
                      ⚙️ <a href="/settings" style={{ textDecoration: 'none', color: config.spec.theme?.primaryColor || '#1976d2' }}>Settings</a>
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
            {currentTemplate && (
              <Typography variant="caption" display="block" style={{ marginTop: 4 }}>
                Current Template: {currentTemplate.id} • Available: {availableTemplates.length}
              </Typography>
            )}
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