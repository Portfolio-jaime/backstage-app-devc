import React from 'react';
import { Grid, Typography, Box, CircularProgress, Paper, Button } from '@material-ui/core';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import {
  HomePageCompanyLogo,
  HomePageStarredEntities,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { FlightOpsWidget } from './widgets/FlightOpsWidget';
import { CostDashboard } from './widgets/CostDashboard';
import { TeamActivity } from './widgets/TeamActivity';
import { SecurityAlerts } from './widgets/SecurityAlerts';
import { SystemHealth } from './widgets/SystemHealth';
import { WorldClock } from './widgets/WorldClock';
import { LiveCatalogServices } from './widgets/LiveCatalogServices';
import { TeamInfoWidget } from './widgets/TeamInfoWidget';
import { RealMetricsWidget } from './widgets/RealMetricsWidget';
import { DailyTipsWidget } from './widgets/DailyTipsWidget';
import { HomePageMarkdown } from '@roadiehq/backstage-plugin-home-markdown';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useDashboardPermissions } from '../../hooks/useDashboardPermissions';
import { DashboardSelector } from './DashboardSelector';
import { DashboardCards } from './DashboardCards';
import { UserPreferences } from './UserPreferences';
import { ThemeSelector } from './ThemeSelector';

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
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  
  // Back to dynamic system from GitHub
  const { 
    config, 
    loading, 
    error, 
    availableTemplates, 
    currentTemplate, 
    switchTemplate 
  } = useDashboardConfig();
  
  // User preferences
  const { preferences } = useUserPreferences();
  
  // Dashboard permissions
  const { currentUser, checkDashboardAccess, getAccessibleDashboards } = useDashboardPermissions();

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
  const spacing = preferences.dashboardLayout?.gridSpacing || spec.layout?.grid?.spacing || 3;

  return (
    <Page themeId="home">
      <Header title={metadata.title} subtitle={metadata.subtitle}>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => setPreferencesOpen(true)}
          >
            Preferences
          </Button>
          <HomePageCompanyLogo />
        </Box>
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
            <InfoCard
              title={
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Box display="flex" alignItems="center" gap={2}>
                    <span>Welcome to {metadata.title}</span>
                    {currentTemplate && currentTemplate.id !== 'ba-main' && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '1.5rem' }}>{currentTemplate.icon}</span>
                        <Typography variant="h6" component="span" color="primary">
                          {currentTemplate.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {currentTemplate && currentTemplate.id !== 'ba-main' && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => switchTemplate('ba-main')}
                      style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                    >
                      ← Back to Main Dashboard
                    </Button>
                  )}
                </Box>
              }
            >
              <Box p={2}>
                <Typography component="div" style={{ whiteSpace: 'pre-line' }}>
                  {config?.content?.welcomeMessage || getWelcomeContent(currentTemplate?.id).replace(/^#\s+.*$/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').trim()}
                </Typography>
                {currentTemplate && currentTemplate.id !== 'ba-main' && (
                  <Box mt={2} p={2} style={{ 
                    backgroundColor: 'rgba(25, 118, 210, 0.08)', 
                    borderRadius: 4,
                    border: '1px solid rgba(25, 118, 210, 0.2)'
                  }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Dashboard Type:</strong> {currentTemplate.category} • <strong>ID:</strong> {currentTemplate.id}
                    </Typography>
                  </Box>
                )}
              </Box>
            </InfoCard>
          </Grid>
          
          {spec.widgets.worldClock?.enabled && preferences.widgetVisibility.worldClock !== false && (
            <Grid item xs={12} md={4}>
              <WorldClock
                title={spec.widgets.worldClock.title || "BA Global Operations Time"}
                timezones={spec.widgets.worldClock.timezones}
              />
            </Grid>
          )}

          {/* Team Information Widget - Show when team info is available */}
          {spec.team && (
            <Grid item xs={12} md={8}>
              <TeamInfoWidget />
            </Grid>
          )}

          {/* Dashboard Navigation Cards - Only show on main dashboard */}
          {(currentTemplate?.id === 'ba-main' || currentTemplate?.id?.includes('main')) && (
            <Grid item xs={12}>
              <InfoCard title="🎯 Navigate to Specialized Dashboards">
                <Box p={2}>
                  <DashboardCards
                    dashboards={availableTemplates
                      .filter(t => !t.id.includes('main'))
                      .filter(t => checkDashboardAccess(t.id).allowed)
                      .map(template => ({
                        id: template.id,
                        name: template.name,
                        icon: template.icon || '📊',
                        description: template.description,
                        category: template.category,
                      }))}
                    onDashboardSelect={switchTemplate}
                  />
                  {currentUser && (
                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary">
                        👤 Logged in as: {currentUser.name} ({currentUser.roles.join(', ')})
                      </Typography>
                    </Box>
                  )}
                </Box>
              </InfoCard>
            </Grid>
          )}

          {/* Dashboard Info and Selector Row - Show on specialized dashboards */}
          {currentTemplate?.id !== 'ba-main' && (
            <>
              <Grid item xs={12} md={6}>
                <InfoCard title={`${currentTemplate?.icon || '📊'} ${currentTemplate?.name || 'Dashboard'}`}>
                  <Box p={2}>
                    <Typography variant="body1" color="textSecondary">
                      Currently viewing: <strong>{currentTemplate?.category} Dashboard</strong>
                    </Typography>
                    <Box mt={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<HomeIcon />}
                        onClick={() => switchTemplate('ba-main')}
                        size="small"
                      >
                        Back to Main Dashboard
                      </Button>
                    </Box>
                  </Box>
                </InfoCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DashboardSelector
                  currentTemplate={currentTemplate}
                  availableTemplates={availableTemplates}
                  onTemplateChange={switchTemplate}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <ThemeSelector
                  currentDashboard={currentTemplate?.id}
                  compact={true}
                />
              </Grid>
            </>
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

          {/* Real Metrics Widget - Show on DevOps and Developer dashboards */}
          {(currentTemplate?.id === 'ba-devops' || currentTemplate?.id === 'ba-developer') && 
           preferences.widgetVisibility.metrics !== false && (
            <Grid item xs={12} md={6}>
              <RealMetricsWidget />
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
            <DailyTipsWidget />
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
      
      {/* User Preferences Modal */}
      <UserPreferences 
        open={preferencesOpen} 
        onClose={() => setPreferencesOpen(false)} 
      />
    </Page>
  );
};

export const homePage = <HomePage />;