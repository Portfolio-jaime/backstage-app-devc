import React, { useState } from 'react';
import { Page, Header, Content, InfoCard, Progress } from '@backstage/core-components';
import { useArgoCD } from '../../hooks/useArgoCD';
import { ArgoCDApplication, getStatusColor } from '../../api/argoCDApi';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  AppBar,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  Search as SearchIcon,
  Apps as AppsIcon,
  AccountTree as ProjectIcon,
  Storage as RepoIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@material-ui/icons';

// Componente de detalle de aplicación
const ApplicationDetailDialog: React.FC<{
  open: boolean;
  application: ArgoCDApplication | null;
  onClose: () => void;
  onSync: (appName: string) => void;
  onRefresh: (appName: string) => void;
}> = ({ open, application, onClose, onSync, onRefresh }) => {
  if (!application) return null;

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
      case 'Degraded':
        return <ErrorIcon style={{ color: '#f44336' }} />;
      case 'Progressing':
        return <ScheduleIcon style={{ color: '#ff9800' }} />;
      default:
        return <WarningIcon style={{ color: '#9e9e9e' }} />;
    }
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'Synced':
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
      case 'OutOfSync':
        return <ErrorIcon style={{ color: '#f44336' }} />;
      default:
        return <WarningIcon style={{ color: '#9e9e9e' }} />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Application: {application.metadata.name}</Typography>
          <Box>
            <Tooltip title="Refresh Application">
              <IconButton onClick={() => onRefresh(application.metadata.name)} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sync Application">
              <IconButton onClick={() => onSync(application.metadata.name)} size="small">
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📋 Application Info</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {application.metadata.name}<br/>
                  <strong>Namespace:</strong> {application.metadata.namespace}<br/>
                  <strong>Project:</strong> {application.spec.project}<br/>
                  <strong>Repository:</strong> {application.spec.source.repoURL}<br/>
                  <strong>Path:</strong> {application.spec.source.path}<br/>
                  <strong>Target Revision:</strong> {application.spec.source.targetRevision}<br/>
                  <strong>Destination:</strong> {application.spec.destination.namespace}@{application.spec.destination.server}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>⚡ Status</Typography>
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getSyncIcon(application.status.sync.status)}
                    <Typography variant="body2" style={{ marginLeft: 8 }}>
                      <strong>Sync Status:</strong> {application.status.sync.status}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Revision: {application.status.sync.revision}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getHealthIcon(application.status.health.status)}
                    <Typography variant="body2" style={{ marginLeft: 8 }}>
                      <strong>Health Status:</strong> {application.status.health.status}
                    </Typography>
                  </Box>
                  {application.status.health.message && (
                    <Typography variant="body2" color="textSecondary">
                      {application.status.health.message}
                    </Typography>
                  )}
                </Box>

                {application.status.operationState && (
                  <Box>
                    <Typography variant="body2">
                      <strong>Last Operation:</strong> {application.status.operationState.phase}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Started: {new Date(application.status.operationState.startedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {application.status.resources && application.status.resources.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>🔧 Resources</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Kind</strong></TableCell>
                          <TableCell><strong>Name</strong></TableCell>
                          <TableCell><strong>Namespace</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Health</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {application.status.resources.map((resource, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{resource.kind}</TableCell>
                            <TableCell>{resource.name}</TableCell>
                            <TableCell>{resource.namespace}</TableCell>
                            <TableCell>
                              <Chip
                                label={resource.status}
                                size="small"
                                color={getStatusColor(resource.status)}
                              />
                            </TableCell>
                            <TableCell>
                              {resource.health && (
                                <Chip
                                  label={resource.health.status}
                                  size="small"
                                  color={getStatusColor(resource.health.status)}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Tab Components
const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>🎯 ArgoCD Statistics</Typography>
          <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
            <Chip label={`${stats.totalApplications} Total Apps`} color="default" size="small" />
            <Chip label={`${stats.syncedApplications} Synced`} color="primary" size="small" />
            <Chip label={`${stats.healthyApplications} Healthy`} color="primary" size="small" />
            <Chip label={`${stats.outOfSyncApplications} Out of Sync`} color="secondary" size="small" />
            {stats.degradedApplications > 0 && (
              <Chip label={`${stats.degradedApplications} Degraded`} color="secondary" size="small" />
            )}
            <Chip
              label={`ArgoCD ${stats.healthy ? '✅ Online' : '❌ Offline'}`}
              color={stats.healthy ? 'primary' : 'secondary'}
              size="small"
            />
            {stats.version && (
              <Chip label={`v${stats.version}`} color="default" size="small" />
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📊 Sync Status Distribution</Typography>
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              Synced: {stats.syncedApplications}/{stats.totalApplications}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(stats.syncedApplications / Math.max(stats.totalApplications, 1)) * 100}
              style={{ height: 8, borderRadius: 4, marginBottom: 16 }}
              color="primary"
            />

            <Typography variant="body2" gutterBottom>
              Out of Sync: {stats.outOfSyncApplications}/{stats.totalApplications}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(stats.outOfSyncApplications / Math.max(stats.totalApplications, 1)) * 100}
              style={{ height: 8, borderRadius: 4 }}
              color="secondary"
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>❤️ Health Status Distribution</Typography>
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              Healthy: {stats.healthyApplications}/{stats.totalApplications}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(stats.healthyApplications / Math.max(stats.totalApplications, 1)) * 100}
              style={{ height: 8, borderRadius: 4, marginBottom: 16 }}
              color="primary"
            />

            <Typography variant="body2" gutterBottom>
              Degraded: {stats.degradedApplications}/{stats.totalApplications}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(stats.degradedApplications / Math.max(stats.totalApplications, 1)) * 100}
              style={{ height: 8, borderRadius: 4 }}
              color="secondary"
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📈 Summary</Typography>
          <Typography variant="body2">
            • <strong>Total Projects</strong>: {stats.projects.length}<br/>
            • <strong>Total Repositories</strong>: {stats.repositories.length}<br/>
            • <strong>Auto-refresh</strong>: Every 30 seconds<br/>
            • <strong>Last Updated</strong>: {stats.lastUpdated}<br/>
            {stats.version && (
              <>• <strong>ArgoCD Version</strong>: v{stats.version}</>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

const ApplicationsTab: React.FC<{
  stats: any;
  searchQuery: string;
  onApplicationClick: (app: ArgoCDApplication) => void;
  onSync: (appName: string) => void;
}> = ({ stats, searchQuery, onApplicationClick, onSync }) => {
  const filteredApps = stats.applications.filter((app: ArgoCDApplication) =>
    app.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.spec.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🚀 Applications ({filteredApps.length})</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Project</strong></TableCell>
                    <TableCell><strong>Sync Status</strong></TableCell>
                    <TableCell><strong>Health</strong></TableCell>
                    <TableCell><strong>Repository</strong></TableCell>
                    <TableCell><strong>Destination</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApps.map((app: ArgoCDApplication, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                          {app.metadata.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.spec.project}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status.sync.status}
                          size="small"
                          color={getStatusColor(app.status.sync.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status.health.status}
                          size="small"
                          color={getStatusColor(app.status.health.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                          {app.spec.source.repoURL.replace('https://github.com/', '')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                          {app.spec.destination.namespace}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" style={{ gap: 4 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => onApplicationClick(app)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sync Application">
                            <IconButton
                              size="small"
                              onClick={() => onSync(app.metadata.name)}
                              disabled={app.status.sync.status === 'Synced'}
                            >
                              <SyncIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Componente principal
export const ArgoCDPage = () => {
  const { stats, loading, error, refresh, syncApplication, isConnected } = useArgoCD();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ArgoCDApplication | null>(null);
  const [appDetailOpen, setAppDetailOpen] = useState(false);

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="ArgoCD Dashboard" subtitle="Loading ArgoCD data..." />
        <Content><Progress /></Content>
      </Page>
    );
  }

  if (error || !stats) {
    return (
      <Page themeId="tool">
        <Header title="ArgoCD Dashboard" subtitle="Error loading ArgoCD data" />
        <Content>
          <InfoCard title="Error">
            <Typography color="error">{error || 'Failed to load ArgoCD data'}</Typography>
            <Typography variant="body2" style={{ marginTop: 16 }}>
              Make sure ArgoCD is running and accessible. You can start it with:
            </Typography>
            <Typography variant="body2" style={{ fontFamily: 'monospace', marginTop: 8 }}>
              kubectl port-forward svc/argocd-server -n argocd 8080:443
            </Typography>
          </InfoCard>
        </Content>
      </Page>
    );
  }

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApplicationClick = (app: ArgoCDApplication) => {
    setSelectedApp(app);
    setAppDetailOpen(true);
  };

  const handleSync = async (appName: string) => {
    const result = await syncApplication(appName);
    if (!result.success) {
      console.error('Sync failed:', result.error);
    }
  };

  const handleRefreshApp = async (appName: string) => {
    // Implement refresh logic if needed
    console.log('Refreshing app:', appName);
  };

  return (
    <Page themeId="tool">
      <Header
        title="ArgoCD Dashboard"
        subtitle={`${isConnected ? '🟢 Connected' : '🔴 Disconnected'} • ${stats.totalApplications} applications • Last updated: ${stats.lastUpdated}`}
      >
        <Button
          startIcon={<RefreshIcon />}
          onClick={refresh}
          size="small"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Header>
      <Content>
        {/* Navigation Tabs */}
        <AppBar position="static" color="default" elevation={1}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<AppsIcon />} label="Overview" />
            <Tab icon={<AppsIcon />} label="Applications" />
            <Tab icon={<ProjectIcon />} label="Projects" />
            <Tab icon={<RepoIcon />} label="Repositories" />
          </Tabs>
        </AppBar>

        {/* Search Controls */}
        {activeTab === 1 && (
          <Box mt={2} mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab Content */}
        <Box mt={3}>
          {activeTab === 0 && <OverviewTab stats={stats} />}
          {activeTab === 1 && (
            <ApplicationsTab
              stats={stats}
              searchQuery={searchQuery}
              onApplicationClick={handleApplicationClick}
              onSync={handleSync}
            />
          )}
          {activeTab === 2 && (
            <Typography variant="h6">📋 Projects - Coming Soon</Typography>
          )}
          {activeTab === 3 && (
            <Typography variant="h6">📦 Repositories - Coming Soon</Typography>
          )}
        </Box>

        {/* Application Detail Dialog */}
        <ApplicationDetailDialog
          open={appDetailOpen}
          application={selectedApp}
          onClose={() => {
            setAppDetailOpen(false);
            setSelectedApp(null);
          }}
          onSync={handleSync}
          onRefresh={handleRefreshApp}
        />
      </Content>
    </Page>
  );
};