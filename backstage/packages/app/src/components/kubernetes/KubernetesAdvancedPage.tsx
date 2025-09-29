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
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@material-ui/core';
import {
  Search as SearchIcon,
  ViewList as ViewListIcon,
  Storage as StorageIcon,
  Computer as ComputerIcon,
  AccountTree as AccountTreeIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CloudQueue as CloudQueueIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkCheckIcon,
  ExpandMore as ExpandMoreIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon
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

// Componente de detalle de Pod mejorado
const PodDetailDialog: React.FC<{
  open: boolean;
  pod: PodMetrics | null;
  onClose: () => void;
}> = ({ open, pod, onClose }) => {
  if (!pod) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Pod Details: {pod.name}</Typography>
          <Chip
            label={pod.status}
            color={pod.status === 'Running' ? 'primary' : 'default'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📋 Pod Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Name" secondary={pod.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Namespace" secondary={pod.namespace} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Node" secondary={pod.node} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={pod.status} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Ready" secondary={pod.ready} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Age" secondary={pod.age} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Restarts" secondary={pod.restarts} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>⚡ Resource Usage</Typography>
                <Box mb={3}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SpeedIcon style={{ marginRight: 8, color: '#1976d2' }} />
                    <Typography variant="body2">
                      CPU Usage: {pod.cpuUsage}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(parseInt(pod.cpuUsage.replace('m', '')) / 10, 100)}
                    style={{ height: 8, borderRadius: 4 }}
                    color="primary"
                  />
                </Box>
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <MemoryIcon style={{ marginRight: 8, color: '#388e3c' }} />
                    <Typography variant="body2">
                      Memory Usage: {pod.memoryUsage}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(parseInt(pod.memoryUsage.replace('Mi', '')) / 10, 100)}
                    style={{ height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>🐳 Container Info</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Image"
                      secondary={
                        <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                          {pod.image}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {pod.labels && (
                    <ListItem>
                      <ListItemText
                        primary="Labels"
                        secondary={
                          <Box mt={1}>
                            {Object.entries(pod.labels).slice(0, 3).map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                variant="outlined"
                                style={{ margin: 2, fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                  )}
                </List>
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

// Overview Tab Component
const OverviewTab: React.FC<{ stats: ClusterStats }> = ({ stats }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>🎯 Cluster Overview</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="primary">{stats.runningPods}/{stats.totalPods}</Typography>
                <Typography variant="body2" color="textSecondary">Running Pods</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="secondary">{stats.deployments}</Typography>
                <Typography variant="body2" color="textSecondary">Deployments</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" style={{ color: '#ff9800' }}>{stats.services}</Typography>
                <Typography variant="body2" color="textSecondary">Services</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" style={{ color: '#9c27b0' }}>{stats.namespaces.length}</Typography>
                <Typography variant="body2" color="textSecondary">Namespaces</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider style={{ margin: '16px 0' }} />

          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip
              label={`Cluster: ${stats.clusterName}`}
              color="primary"
              size="small"
              icon={<CloudQueueIcon />}
            />
            <Chip
              label={stats.healthy ? '🟢 Connected' : '🔴 Disconnected'}
              color={stats.healthy ? 'primary' : 'secondary'}
              size="small"
            />
            {stats.version && (
              <Chip label={`Kubernetes v${stats.version}`} color="default" size="small" />
            )}
            <Chip label={`Updated: ${stats.lastUpdated}`} color="default" size="small" />
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>🖥️ Node Health</Typography>
          {stats.nodeMetrics.map((node, index) => (
            <Accordion key={index} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', flex: 1 }}>
                    {node.name}
                  </Typography>
                  <Chip
                    label={node.status}
                    size="small"
                    color={node.status === 'Ready' ? 'primary' : 'secondary'}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box width="100%">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        CPU: {node.cpuUsage} ({node.cpuPercent}%)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={node.cpuPercent}
                        style={{ height: 6, borderRadius: 3 }}
                        color={node.cpuPercent > 80 ? 'secondary' : 'primary'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Memory: {node.memoryUsage} ({node.memoryPercent}%)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={node.memoryPercent}
                        style={{ height: 6, borderRadius: 3 }}
                        color={node.memoryPercent > 80 ? 'secondary' : 'primary'}
                      />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary">
                      Role: {node.roles} • Version: {node.version} • Age: {node.age}
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Resource Summary</Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><SpeedIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Total CPU Usage"
                secondary={`${stats.podMetrics.reduce((acc, pod) =>
                  acc + parseInt(pod.cpuUsage.replace('m', '')), 0)}m across all pods`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MemoryIcon color="secondary" /></ListItemIcon>
              <ListItemText
                primary="Total Memory Usage"
                secondary={`${stats.podMetrics.reduce((acc, pod) =>
                  acc + parseInt(pod.memoryUsage.replace('Mi', '')), 0)}Mi across all pods`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><RefreshIcon color="action" /></ListItemIcon>
              <ListItemText
                primary="Auto-refresh"
                secondary="Every 30 seconds"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Pods Tab Component
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">🚀 Pods ({filteredPods.length})</Typography>
              <Box display="flex" gap={1}>
                <Chip label={`${filteredPods.filter(p => p.status === 'Running').length} Running`} color="primary" size="small" />
                <Chip label={`${filteredPods.filter(p => p.status !== 'Running').length} Other`} color="default" size="small" />
              </Box>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Namespace</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Ready</strong></TableCell>
                    <TableCell><strong>Node</strong></TableCell>
                    <TableCell><strong>CPU</strong></TableCell>
                    <TableCell><strong>Memory</strong></TableCell>
                    <TableCell><strong>Restarts</strong></TableCell>
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
                                           pod.namespace === 'dev1' ? '#4caf50' :
                                           pod.namespace === 'argocd' ? '#9c27b0' :
                                           pod.namespace === 'backstage' ? '#2196f3' : '#e0e0e0',
                            color: pod.namespace === 'prod1' || pod.namespace === 'dev1' ||
                                   pod.namespace === 'argocd' || pod.namespace === 'backstage' ? 'white' : 'black'
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
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {pod.node}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <SpeedIcon style={{ fontSize: 12, marginRight: 4, color: '#1976d2' }} />
                          {pod.cpuUsage}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <MemoryIcon style={{ fontSize: 12, marginRight: 4, color: '#388e3c' }} />
                          {pod.memoryUsage}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pod.restarts}
                          size="small"
                          color={pod.restarts > 0 ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{pod.age}</TableCell>
                      <TableCell>
                        <Button
                          startIcon={<VisibilityIcon />}
                          size="small"
                          onClick={() => onPodClick(pod)}
                          variant="outlined"
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

// Services Tab Component
const ServicesTab: React.FC<{ stats: ClusterStats }> = ({ stats }) => {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await kubernetesApi.getServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Progress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🌐 Services ({services.length})</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Namespace</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Cluster IP</strong></TableCell>
                    <TableCell><strong>Ports</strong></TableCell>
                    <TableCell><strong>Age</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {service.metadata.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.metadata.namespace}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.spec.type}
                          size="small"
                          color={service.spec.type === 'LoadBalancer' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                          {service.spec.clusterIP}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {service.spec.ports?.slice(0, 3).map((port: any, idx: number) => (
                            <Chip
                              key={idx}
                              label={`${port.port}/${port.protocol}`}
                              size="small"
                              variant="outlined"
                              style={{ margin: 1 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const created = new Date(service.metadata.creationTimestamp);
                          const now = new Date();
                          const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                          return diffDays > 0 ? `${diffDays}d` : 'Today';
                        })()}
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

// Deployments Tab Component
const DeploymentsTab: React.FC<{ stats: ClusterStats }> = ({ stats }) => {
  const [deployments, setDeployments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const deploymentsData = await kubernetesApi.getDeployments();
        setDeployments(deploymentsData);
      } catch (error) {
        console.error('Error fetching deployments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Progress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🚀 Deployments ({deployments.length})</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Namespace</strong></TableCell>
                    <TableCell><strong>Ready</strong></TableCell>
                    <TableCell><strong>Up-to-date</strong></TableCell>
                    <TableCell><strong>Available</strong></TableCell>
                    <TableCell><strong>Age</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deployments.map((deployment, index) => {
                    const ready = deployment.status.readyReplicas || 0;
                    const desired = deployment.spec.replicas || 0;
                    const isHealthy = ready === desired;

                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {deployment.metadata.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={deployment.metadata.namespace}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2">
                              {ready}/{desired}
                            </Typography>
                            <Box ml={1}>
                              <Chip
                                label={isHealthy ? 'Ready' : 'Pending'}
                                size="small"
                                color={isHealthy ? 'primary' : 'default'}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{deployment.status.updatedReplicas || 0}</TableCell>
                        <TableCell>{deployment.status.availableReplicas || 0}</TableCell>
                        <TableCell>
                          {(() => {
                            const created = new Date(deployment.metadata.creationTimestamp);
                            const now = new Date();
                            const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                            return diffDays > 0 ? `${diffDays}d` : 'Today';
                          })()}
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={(ready / Math.max(desired, 1)) * 100}
                            style={{ width: 60, height: 6, borderRadius: 3 }}
                            color={isHealthy ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Resources Tab Component
const ResourcesTab: React.FC<{ stats: ClusterStats }> = ({ stats }) => {
  const [resourceQuotas, setResourceQuotas] = React.useState<any[]>([]);
  const [limitRanges, setLimitRanges] = React.useState<any[]>([]);
  const [persistentVolumes, setPersistentVolumes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResources = async () => {
      try {
        const [quotas, limits, pvs] = await Promise.all([
          kubernetesApi.getResourceQuotas(),
          kubernetesApi.getLimitRanges(),
          kubernetesApi.getPersistentVolumes(),
        ]);
        setResourceQuotas(quotas);
        setLimitRanges(limits);
        setPersistentVolumes(pvs);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Progress />
      </Box>
    );
  }

  // Calculate resource usage summary from pods
  const resourceSummary = React.useMemo(() => {
    const totalCpuUsage = stats.podMetrics.reduce((acc, pod) =>
      acc + parseInt(pod.cpuUsage.replace('m', '')), 0);
    const totalMemoryUsage = stats.podMetrics.reduce((acc, pod) =>
      acc + parseInt(pod.memoryUsage.replace('Mi', '')), 0);

    // Get pods with resource requests/limits
    const podsWithResources = stats.podMetrics.filter(pod =>
      pod.cpuUsage !== '0m' || pod.memoryUsage !== '0Mi'
    );

    return {
      totalCpuUsage,
      totalMemoryUsage,
      podsWithResources: podsWithResources.length,
      totalPods: stats.podMetrics.length,
    };
  }, [stats.podMetrics]);

  return (
    <Grid container spacing={3}>
      {/* Resource Usage Overview */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📊 Resource Usage Overview</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2} style={{ backgroundColor: '#e3f2fd', borderRadius: 8 }}>
                  <SpeedIcon style={{ fontSize: 32, color: '#1976d2', marginBottom: 8 }} />
                  <Typography variant="h5" color="primary">{resourceSummary.totalCpuUsage}m</Typography>
                  <Typography variant="body2" color="textSecondary">Total CPU Usage</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2} style={{ backgroundColor: '#e8f5e8', borderRadius: 8 }}>
                  <MemoryIcon style={{ fontSize: 32, color: '#388e3c', marginBottom: 8 }} />
                  <Typography variant="h5" style={{ color: '#388e3c' }}>{resourceSummary.totalMemoryUsage}Mi</Typography>
                  <Typography variant="body2" color="textSecondary">Total Memory Usage</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2} style={{ backgroundColor: '#fff3e0', borderRadius: 8 }}>
                  <AssessmentIcon style={{ fontSize: 32, color: '#f57c00', marginBottom: 8 }} />
                  <Typography variant="h5" style={{ color: '#f57c00' }}>{resourceSummary.podsWithResources}</Typography>
                  <Typography variant="body2" color="textSecondary">Pods with Metrics</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2} style={{ backgroundColor: '#fce4ec', borderRadius: 8 }}>
                  <CloudQueueIcon style={{ fontSize: 32, color: '#c2185b', marginBottom: 8 }} />
                  <Typography variant="h5" style={{ color: '#c2185b' }}>{stats.nodeMetrics.length}</Typography>
                  <Typography variant="body2" color="textSecondary">Active Nodes</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Pod Resource Usage Details */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🚀 Pod Resource Details</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Pod Name</strong></TableCell>
                    <TableCell><strong>Namespace</strong></TableCell>
                    <TableCell><strong>CPU Usage</strong></TableCell>
                    <TableCell><strong>Memory Usage</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Node</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.podMetrics
                    .filter(pod => pod.cpuUsage !== '0m' || pod.memoryUsage !== '0Mi')
                    .sort((a, b) => parseInt(b.cpuUsage.replace('m', '')) - parseInt(a.cpuUsage.replace('m', '')))
                    .map((pod, index) => {
                      const cpuValue = parseInt(pod.cpuUsage.replace('m', ''));
                      const memoryValue = parseInt(pod.memoryUsage.replace('Mi', ''));

                      return (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {pod.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={pod.namespace} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <SpeedIcon style={{ fontSize: 12, marginRight: 4, color: '#1976d2' }} />
                              <Typography variant="body2">{pod.cpuUsage}</Typography>
                              <Box ml={1} width={60}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(cpuValue / 10, 100)}
                                  style={{ height: 4, borderRadius: 2 }}
                                  color={cpuValue > 500 ? 'secondary' : 'primary'}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <MemoryIcon style={{ fontSize: 12, marginRight: 4, color: '#388e3c' }} />
                              <Typography variant="body2">{pod.memoryUsage}</Typography>
                              <Box ml={1} width={60}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(memoryValue / 10, 100)}
                                  style={{ height: 4, borderRadius: 2 }}
                                  color={memoryValue > 1000 ? 'secondary' : 'primary'}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={pod.status}
                              size="small"
                              color={pod.status === 'Running' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="textSecondary">
                              {pod.node}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Node Resource Usage */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🖥️ Node Resources</Typography>
            {stats.nodeMetrics.map((node, index) => (
              <Box key={index} mb={3} p={2} style={{ backgroundColor: '#fafafa', borderRadius: 8 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }} gutterBottom>
                  {node.name}
                </Typography>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <SpeedIcon style={{ fontSize: 16, marginRight: 4, color: '#1976d2' }} />
                      <Typography variant="body2">CPU</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {node.cpuUsage} ({node.cpuPercent}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={node.cpuPercent}
                    style={{ height: 8, borderRadius: 4 }}
                    color={node.cpuPercent > 80 ? 'secondary' : 'primary'}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <MemoryIcon style={{ fontSize: 16, marginRight: 4, color: '#388e3c' }} />
                      <Typography variant="body2">Memory</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {node.memoryUsage} ({node.memoryPercent}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={node.memoryPercent}
                    style={{ height: 8, borderRadius: 4 }}
                    color={node.memoryPercent > 80 ? 'secondary' : 'primary'}
                  />
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label={node.status} size="small" color="primary" />
                  <Chip label={node.roles} size="small" variant="outlined" />
                  <Chip label={node.version} size="small" variant="outlined" />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Resource Quotas */}
      {resourceQuotas.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📏 Resource Quotas</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Namespace</strong></TableCell>
                      <TableCell><strong>Used/Hard</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resourceQuotas.map((quota, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{quota.metadata.name}</TableCell>
                        <TableCell>
                          <Chip label={quota.metadata.namespace} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {Object.keys(quota.status?.used || {}).length} resources
                          </Typography>
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

      {/* Persistent Volumes */}
      {persistentVolumes.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>💾 Persistent Volumes</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Capacity</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Claim</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {persistentVolumes.map((pv, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{pv.metadata.name}</TableCell>
                        <TableCell>{pv.spec?.capacity?.storage || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={pv.status?.phase || 'Unknown'}
                            size="small"
                            color={pv.status?.phase === 'Bound' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {pv.spec?.claimRef ? (
                            <Typography variant="caption">
                              {pv.spec.claimRef.namespace}/{pv.spec.claimRef.name}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              Unbound
                            </Typography>
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
  );
};

// Main Kubernetes Advanced Page Component
const KubernetesAdvancedPage = () => {
  const { stats, loading, error, refresh, isConnected } = useKubernetesCluster();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [selectedPod, setSelectedPod] = useState<PodMetrics | null>(null);
  const [podDetailOpen, setPodDetailOpen] = useState(false);

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Kubernetes Advanced Dashboard" subtitle="Loading cluster data..." />
        <Content>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Box textAlign="center">
              <Progress />
              <Typography variant="h6" style={{ marginTop: 16 }}>
                Connecting to Kubernetes cluster...
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Fetching real-time data from your Kind cluster
              </Typography>
            </Box>
          </Box>
        </Content>
      </Page>
    );
  }

  if (error || !stats) {
    return (
      <Page themeId="tool">
        <Header title="Kubernetes Advanced Dashboard" subtitle="Connection issue detected" />
        <Content>
          <InfoCard title="Connection Error">
            <Typography color="error" gutterBottom>
              {error || 'Failed to load cluster metrics'}
            </Typography>
            <Typography variant="body2" paragraph>
              This could be due to:
            </Typography>
            <ul>
              <li>Kubernetes proxy not running (run: kubectl proxy --port=8001)</li>
              <li>Cluster not accessible</li>
              <li>Network connectivity issues</li>
            </ul>
            <Box mt={2}>
              <Button onClick={refresh} variant="contained" color="primary" startIcon={<RefreshIcon />}>
                Retry Connection
              </Button>
            </Box>
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

  const connectionStatus = isConnected ? '🟢 Connected' : '🔴 Using Mock Data';
  const connectionColor = isConnected ? '#4caf50' : '#ff9800';

  return (
    <Page themeId="tool">
      <Header
        title="Kubernetes Advanced Dashboard"
        subtitle={
          <Box display="flex" alignItems="center" gap={2}>
            <span>{stats ? `Cluster: ${stats.clusterName}` : 'Loading...'}</span>
            <Chip
              label={connectionStatus}
              size="small"
              style={{
                backgroundColor: connectionColor,
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <span>Last updated: {stats.lastUpdated}</span>
          </Box>
        }
      >
        <Button
          startIcon={<RefreshIcon />}
          onClick={refresh}
          size="small"
          disabled={loading}
          variant="outlined"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Header>

      <Content>
        {/* Enhanced Navigation Tabs */}
        <AppBar position="static" color="default" elevation={1} style={{ marginBottom: 24 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<ViewListIcon />}
              label="Overview"
              style={{ minWidth: 100 }}
            />
            <Tab
              icon={<StorageIcon />}
              label={`Pods (${stats.totalPods})`}
              style={{ minWidth: 100 }}
            />
            <Tab
              icon={<NetworkCheckIcon />}
              label={`Services (${stats.services})`}
              style={{ minWidth: 100 }}
            />
            <Tab
              icon={<ComputerIcon />}
              label={`Deployments (${stats.deployments})`}
              style={{ minWidth: 100 }}
            />
            <Tab
              icon={<AssessmentIcon />}
              label="Resources"
              style={{ minWidth: 100 }}
            />
            <Tab
              icon={<SecurityIcon />}
              label="Security"
              style={{ minWidth: 100 }}
            />
          </Tabs>
        </AppBar>

        {/* Search and Filter Controls for Pods */}
        {activeTab === 1 && (
          <Box mb={3}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
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
                  <Grid item xs={12} sm={6} md={3}>
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
                  <Grid item xs={12} sm={12} md={5}>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={`${stats.runningPods} Running`}
                        color="primary"
                        size="small"
                        icon={<StorageIcon />}
                      />
                      <Chip
                        label={`${stats.totalPods - stats.runningPods} Other`}
                        color="default"
                        size="small"
                      />
                      <Chip
                        label={`${stats.namespaces.length} Namespaces`}
                        color="secondary"
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Tab Content */}
        <Box>
          {activeTab === 0 && <OverviewTab stats={stats} />}
          {activeTab === 1 && (
            <PodsTab
              stats={stats}
              searchQuery={searchQuery}
              selectedNamespace={selectedNamespace}
              onPodClick={handlePodClick}
            />
          )}
          {activeTab === 2 && <ServicesTab stats={stats} />}
          {activeTab === 3 && <DeploymentsTab stats={stats} />}
          {activeTab === 4 && <ResourcesTab stats={stats} />}
          {activeTab === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🔒 Security Dashboard</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Security features including RBAC, Network Policies, and Pod Security will be available here.
                    </Typography>
                    <Box mt={2}>
                      <Chip label="Coming Soon" color="default" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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

export default KubernetesAdvancedPage;
export { OverviewTab, PodsTab, ServicesTab, DeploymentsTab, ResourcesTab };