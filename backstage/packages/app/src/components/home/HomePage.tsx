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

const welcomeMarkdown = `
# Welcome to British Airways Developer Portal 🛫

**Your central hub for all development operations**

- 🚀 **Quick Start**: Access templates and scaffolding tools
- 📊 **Monitor**: Real-time metrics and system health
- 🔧 **Deploy**: CI/CD pipelines and deployment status
- 📚 **Learn**: Documentation and best practices
- 🔒 **Secure**: Security alerts and compliance tools

---
*"To fly. To serve. To code."* - BA DevOps Motto
`;

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
        {/* Dashboard Selector */}
        <Box mb={2}>
          <DashboardSelector
            availableTemplates={availableTemplates}
            currentTemplate={currentTemplate}
            onTemplateChange={switchTemplate}
            loading={loading}
          />
        </Box>
        
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
            <HomePageMarkdown 
              title="Welcome Aboard!"
              content={welcomeMarkdown}
              path=""
            />
          </Grid>
          
          {spec.widgets.worldClock?.enabled && (
            <Grid item xs={12} md={4}>
              <WorldClock />
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
                <Typography variant="body2" gutterBottom>
                  🚀 <a href="/create" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Create New Service</a>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📊 <a href="/catalog" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Browse Catalog</a>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  📚 <a href="/docs" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>Documentation Hub</a>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  🔍 <a href="/api-docs" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>API Explorer</a>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  ⚙️ <a href="/settings" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>User Settings</a>
                </Typography>
                <Typography variant="body2">
                  📈 <a href="/catalog-graph" style={{ textDecoration: 'none', color: spec.theme?.primaryColor || '#1976d2' }}>System Graph</a>
                </Typography>
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