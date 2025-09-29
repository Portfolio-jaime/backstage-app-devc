import React, { useState } from 'react';
import { Page, Header, Content, InfoCard, Progress } from '@backstage/core-components';
import { useKubernetesCluster } from '../../hooks/useKubernetesCluster';
import { kubernetesApi } from '../../api/kubernetesApi';
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
  DialogActions
} from '@material-ui/core';
import {
  Search as SearchIcon,
  ViewList as ViewListIcon,
  Storage as StorageIcon,
  Computer as ComputerIcon,
  AccountTree as AccountTreeIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@material-ui/icons';

// Import types from hook
import type {
  ProcessedPodMetrics as PodMetrics,
  ClusterStats,
} from '../../hooks/useKubernetesCluster';

// Component para mostrar logs reales de pods
const PodLogsComponent: React.FC<{ pod: PodMetrics }> = ({ pod }) => {
  const [logs, setLogs] = useState<string>('Loading logs...');

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        const podLogs = await kubernetesApi.getPodLogs(pod.namespace, pod.name);
        setLogs(podLogs || 'No logs available');
      } catch (error) {
        setLogs('Error fetching logs: ' + (error as Error).message);
      }
    };

    fetchLogs();
  }, [pod.namespace, pod.name]);

  return (
    <Paper
      style={{
        padding: 16,
        backgroundColor: '#1e1e1e',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        maxHeight: 300,
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}
    >
      {logs}
    </Paper>
  );
};

// Componente de detalle de Pod
const PodDetailDialog: React.FC<{
  open: boolean;
  pod: PodMetrics | null;
  onClose: () => void;
}> = ({ open, pod, onClose }) => {
  if (!pod) return null;


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Pod Details: {pod.name}</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📋 Pod Information</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {pod.name}<br/>
                  <strong>Namespace:</strong> {pod.namespace}<br/>
                  <strong>Node:</strong> {pod.node}<br/>
                  <strong>Status:</strong> {pod.status}<br/>
                  <strong>Ready:</strong> {pod.ready}<br/>
                  <strong>Age:</strong> {pod.age}<br/>
                  <strong>Image:</strong> {pod.image}<br/>
                  <strong>Restarts:</strong> {pod.restarts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>⚡ Resource Usage</Typography>
                <Box mb={2}>
                  <Typography variant="body2" gutterBottom>
                    CPU Usage: {pod.cpuUsage}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseInt(pod.cpuUsage.replace('m', '')) / 10}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Memory Usage: {pod.memoryUsage}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseInt(pod.memoryUsage.replace('Mi', '')) / 2}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📄 Live Pod Logs</Typography>
                <PodLogsComponent pod={pod} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Tab Components
const OverviewTab: React.FC<{ stats: ClusterStats }> = ({ stats }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>🎯 Cluster Statistics</Typography>
          <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
            <Chip label={`${stats.runningPods}/${stats.totalPods} Pods Running`} color="primary" size="small" />
            <Chip label={`${stats.deployments} Deployments`} color="secondary" size="small" />
            <Chip label={`${stats.services} Services`} color="default" size="small" />
            <Chip label={`${stats.namespaces.length} Namespaces`} color="default" size="small" />
            <Chip
              label={`Cluster ${stats.healthy ? '✅ Online' : '❌ Offline'}`}
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
          <Typography variant="h6" gutterBottom>🖥️ Node Health</Typography>
          {stats.nodeMetrics.map((node, index) => (
            <Box key={index} mb={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                {node.name} ({node.roles})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Status: <Chip label={node.status} size="small" color={node.status === 'Ready' ? 'primary' : 'secondary'} />
                {node.version && <> • Kubelet: {node.version}</>}
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  CPU: {node.cpuUsage} ({node.cpuPercent}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={node.cpuPercent}
                  style={{ height: 6, borderRadius: 3, marginBottom: 8 }}
                  color={node.cpuPercent > 80 ? 'secondary' : 'primary'}
                />
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Memory: {node.memoryUsage} ({node.memoryPercent}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={node.memoryPercent}
                  style={{ height: 6, borderRadius: 3 }}
                  color={node.memoryPercent > 80 ? 'secondary' : 'primary'}
                />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📈 Resource Summary</Typography>
          <Typography variant="body2">
            • <strong>Total CPU Usage</strong>: {
              stats.podMetrics.reduce((acc, pod) =>
                acc + parseInt(pod.cpuUsage.replace('m', '')), 0
              )
            }m across all pods<br/>
            • <strong>Total Memory Usage</strong>: {
              stats.podMetrics.reduce((acc, pod) =>
                acc + parseInt(pod.memoryUsage.replace('Mi', '')), 0
              )
            }Mi across all pods<br/>
            • <strong>Auto-refresh</strong>: Every 30 seconds<br/>
            • <strong>Cluster</strong>: {stats.clusterName} {stats.healthy ? '✅ Online' : '❌ Offline'}<br/>
            • <strong>Last Updated</strong>: {stats.lastUpdated}<br/>
            {stats.version && (
              <>• <strong>Kubernetes Version</strong>: v{stats.version}</>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

const PodsTab: React.FC<{
  stats: ClusterStats;
  searchQuery: string;
  selectedNamespace: string;
  onPodClick: (pod: PodMetrics) => void;
}> = ({ stats, searchQuery, selectedNamespace, onPodClick }) => {
  const filteredPods = stats.podMetrics.filter(pod => {
    const matchesSearch = pod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNamespace = selectedNamespace === 'all' || pod.namespace === selectedNamespace;
    return matchesSearch && matchesNamespace;
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🚀 Pods ({filteredPods.length})</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Namespace</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Ready</strong></TableCell>
                    <TableCell><strong>CPU</strong></TableCell>
                    <TableCell><strong>Memory</strong></TableCell>
                    <TableCell><strong>Age</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPods.map((pod, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {pod.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pod.namespace}
                          size="small"
                          variant="outlined"
                          style={{
                            backgroundColor: pod.namespace === 'prod1' ? '#ff9800' :
                                           pod.namespace === 'dev1' ? '#4caf50' : '#e0e0e0',
                            color: pod.namespace === 'prod1' || pod.namespace === 'dev1' ? 'white' : 'black'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pod.status}
                          size="small"
                          color={pod.status === 'Running' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{pod.ready}</TableCell>
                      <TableCell>{pod.cpuUsage}</TableCell>
                      <TableCell>{pod.memoryUsage}</TableCell>
                      <TableCell>{pod.age}</TableCell>
                      <TableCell>
                        <Button
                          startIcon={<VisibilityIcon />}
                          size="small"
                          onClick={() => onPodClick(pod)}
                        >
                          Details
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
};

// Componente principal
export const KubernetesPage = () => {
  const { stats, loading, error, refresh, isConnected } = useKubernetesCluster();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [selectedPod, setSelectedPod] = useState<PodMetrics | null>(null);
  const [podDetailOpen, setPodDetailOpen] = useState(false);

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Kubernetes Dashboard" subtitle="Loading cluster data..." />
        <Content><Progress /></Content>
      </Page>
    );
  }

  if (error || !stats) {
    return (
      <Page themeId="tool">
        <Header title="Kubernetes Dashboard" subtitle="Error loading cluster data" />
        <Content>
          <InfoCard title="Error">
            <Typography color="error">{error || 'Failed to load cluster metrics'}</Typography>
          </InfoCard>
        </Content>
      </Page>
    );
  }

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePodClick = (pod: PodMetrics) => {
    setSelectedPod(pod);
    setPodDetailOpen(true);
  };

  return (
    <Page themeId="tool">
      <Header
        title="Kubernetes Dashboard"
        subtitle={stats ? `Cluster: ${stats.clusterName} • ${isConnected ? '🟢 Connected' : '🔴 Disconnected'} • Last updated: ${stats.lastUpdated}` : 'Loading...'}
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
            <Tab icon={<ViewListIcon />} label="Overview" />
            <Tab icon={<StorageIcon />} label="Pods" />
            <Tab icon={<AccountTreeIcon />} label="Services" />
            <Tab icon={<ComputerIcon />} label="Deployments" />
          </Tabs>
        </AppBar>

        {/* Search and Filter Controls */}
        {activeTab === 1 && (
          <Box mt={2} mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search pods..."
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Namespace"
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="all">All Namespaces</option>
                  {stats.namespaces.map(ns => (
                    <option key={ns} value={ns}>{ns}</option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab Content */}
        <Box mt={3}>
          {activeTab === 0 && <OverviewTab stats={stats} />}
          {activeTab === 1 && (
            <PodsTab
              stats={stats}
              searchQuery={searchQuery}
              selectedNamespace={selectedNamespace}
              onPodClick={handlePodClick}
            />
          )}
          {activeTab === 2 && (
            <Typography variant="h6">🌐 Services - Coming Soon</Typography>
          )}
          {activeTab === 3 && (
            <Typography variant="h6">🚀 Deployments - Coming Soon</Typography>
          )}
        </Box>

        {/* Pod Detail Dialog */}
        <PodDetailDialog
          open={podDetailOpen}
          pod={selectedPod}
          onClose={() => {
            setPodDetailOpen(false);
            setSelectedPod(null);
          }}
        />
      </Content>
    </Page>
  );
};