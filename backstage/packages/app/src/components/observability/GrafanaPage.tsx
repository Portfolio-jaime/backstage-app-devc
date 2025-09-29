import React, { useState, useEffect } from 'react';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
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
  Button,
  Tabs,
  Tab,
  AppBar,
} from '@material-ui/core';
import {
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  OpenInNew as OpenInNewIcon,
} from '@material-ui/icons';

interface GrafanaDashboard {
  id: number;
  uid: string;
  title: string;
  tags: string[];
  type: string;
  uri: string;
  url: string;
  folderId: number;
  folderTitle: string;
  folderUid: string;
  folderUrl: string;
  isStarred: boolean;
}

export const GrafanaPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboards, setDashboards] = useState<GrafanaDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL || process.env.REACT_APP_GRAFANA_URL_LOCAL || 'http://localhost:3010';
  const grafanaUsername = process.env.REACT_APP_GRAFANA_USERNAME || 'admin';
  const grafanaPassword = process.env.REACT_APP_GRAFANA_PASSWORD || 'admin123';

  const fetchGrafanaData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test connection with basic auth
      const credentials = btoa(`${grafanaUsername}:${grafanaPassword}`);

      // Test health endpoint with CORS handling
      const healthResponse = await fetch(`${grafanaUrl}/api/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!healthResponse.ok) {
        throw new Error(`Grafana health check failed: ${healthResponse.status}`);
      }
      setConnected(true);

      // Fetch dashboards with CORS handling
      const dashboardsResponse = await fetch(`${grafanaUrl}/api/search?type=dash-db`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (dashboardsResponse.ok) {
        const dashboardsData = await dashboardsResponse.json();
        setDashboards(dashboardsData || []);
      } else {
        throw new Error(`Failed to fetch dashboards: ${dashboardsResponse.status}`);
      }

    } catch (err) {
      console.error('Grafana connection error:', err);
      setError(`CORS Error: Unable to connect to Grafana. This is likely due to Cross-Origin Resource Sharing (CORS) restrictions. Try accessing Grafana directly at ${grafanaUrl}`);
      setConnected(false);

      // Mock data for development
      setDashboards([
        {
          id: 1,
          uid: 'kubernetes-cluster',
          title: 'Kubernetes Cluster Overview',
          tags: ['kubernetes', 'cluster'],
          type: 'dash-db',
          uri: 'db/kubernetes-cluster',
          url: '/d/kubernetes-cluster/kubernetes-cluster-overview',
          folderId: 0,
          folderTitle: '',
          folderUid: '',
          folderUrl: '',
          isStarred: false,
        },
        {
          id: 2,
          uid: 'node-exporter',
          title: 'Node Exporter Full',
          tags: ['prometheus', 'node-exporter'],
          type: 'dash-db',
          uri: 'db/node-exporter',
          url: '/d/node-exporter/node-exporter-full',
          folderId: 0,
          folderTitle: '',
          folderUid: '',
          folderUrl: '',
          isStarred: true,
        },
        {
          id: 3,
          uid: 'argocd-operational',
          title: 'ArgoCD Operational',
          tags: ['argocd', 'gitops'],
          type: 'dash-db',
          uri: 'db/argocd-operational',
          url: '/d/argocd-operational/argocd-operational',
          folderId: 0,
          folderTitle: '',
          folderUid: '',
          folderUrl: '',
          isStarred: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrafanaData();
  }, []);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const openDashboard = (dashboard: GrafanaDashboard) => {
    const fullUrl = `${grafanaUrl}${dashboard.url}`;
    window.open(fullUrl, '_blank');
  };

  const OverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📊 Grafana Status</Typography>
            <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
              <Chip
                label={connected ? '✅ Connected' : '❌ Disconnected'}
                color={connected ? 'primary' : 'secondary'}
                size="small"
              />
              <Chip label={`${dashboards.length} Dashboards`} color="default" size="small" />
              <Chip label={`${dashboards.filter(d => d.isStarred).length} Starred`} color="primary" size="small" />
              <Chip label={`URL: ${grafanaUrl}`} color="default" size="small" />
            </Box>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(grafanaUrl, '_blank')}
                startIcon={<OpenInNewIcon />}
              >
                Open Grafana
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📋 Quick Access</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Pre-configured dashboards for monitoring your Kubernetes infrastructure
            </Typography>

            <Grid container spacing={2} style={{ marginTop: 16 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Kubernetes Overview</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Cluster health, node status, and resource usage
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => window.open(`${grafanaUrl}/d/kubernetes-cluster/kubernetes-cluster-overview`, '_blank')}
                    >
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Node Metrics</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      CPU, memory, disk, and network metrics per node
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => window.open(`${grafanaUrl}/d/node-exporter/node-exporter-full`, '_blank')}
                    >
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>ArgoCD Metrics</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Application deployment and sync status
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => window.open(`${grafanaUrl}/d/argocd-operational/argocd-operational`, '_blank')}
                    >
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const DashboardsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📈 Available Dashboards ({dashboards.length})</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Tags</strong></TableCell>
                    <TableCell><strong>Folder</strong></TableCell>
                    <TableCell><strong>Starred</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboards.map((dashboard) => (
                    <TableRow key={dashboard.id} hover>
                      <TableCell>
                        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                          {dashboard.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" style={{ gap: 4 }}>
                          {dashboard.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{dashboard.folderTitle || 'General'}</TableCell>
                      <TableCell>
                        {dashboard.isStarred ? '⭐' : ''}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<OpenInNewIcon />}
                          onClick={() => openDashboard(dashboard)}
                        >
                          Open
                        </Button>
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

  return (
    <Page themeId="tool">
      <Header
        title="Grafana Dashboards"
        subtitle={`Visualization and monitoring • ${connected ? '🟢 Connected' : '🔴 Disconnected'} • ${grafanaUrl}`}
      >
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchGrafanaData}
          size="small"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Header>
      <Content>
        {error && !connected && (
          <Box mb={2}>
            <InfoCard title="🔴 Grafana Connection Issue">
              <Typography color="textSecondary" gutterBottom>
                {error.includes('CORS')
                  ? 'Unable to connect due to CORS (Cross-Origin Resource Sharing) restrictions. This is normal for browser security.'
                  : `Unable to connect to Grafana at ${grafanaUrl}.`
                }
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Credentials:</strong> admin / admin123
              </Typography>

              <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(grafanaUrl, '_blank')}
                  color="primary"
                >
                  Open Grafana Directly
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DashboardIcon />}
                  onClick={() => window.open(`${grafanaUrl}/d/efa86fd1d0c121a26444b636a3f509a8/kubernetes-compute-resources-cluster`, '_blank')}
                  color="secondary"
                >
                  K8s Cluster Dashboard
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AssessmentIcon />}
                  onClick={() => window.open(`${grafanaUrl}/d/ff635a025bcfea7bc3dd4f508990a3e9/kubernetes-networking-cluster`, '_blank')}
                  color="secondary"
                >
                  Network Dashboard
                </Button>
              </Box>

              <Typography variant="caption" style={{ marginTop: 8, display: 'block' }}>
                💡 <strong>Tip:</strong> Open dashboards directly in new tabs to bypass CORS restrictions
              </Typography>
            </InfoCard>
          </Box>
        )}

        <AppBar position="static" color="default" elevation={1}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<AssessmentIcon />} label="Overview" />
            <Tab icon={<DashboardIcon />} label="Dashboards" />
          </Tabs>
        </AppBar>

        <Box mt={3}>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <DashboardsTab />}
        </Box>
      </Content>
    </Page>
  );
};