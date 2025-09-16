import React, { useState, useEffect, useCallback } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloudIcon from '@material-ui/icons/Cloud';
import StorageIcon from '@material-ui/icons/Storage';
import MemoryIcon from '@material-ui/icons/Memory';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import RefreshIcon from '@material-ui/icons/Refresh';
import ComputerIcon from '@material-ui/icons/Computer';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles((theme) => ({
  healthCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[2],
    },
  },
  healthyStatus: {
    color: theme.palette.success.main,
  },
  warningStatus: {
    color: theme.palette.warning.main,
  },
  errorStatus: {
    color: theme.palette.error.main,
  },
  metricValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  progressBar: {
    marginTop: theme.spacing(1),
    height: 6,
    borderRadius: 3,
  },
  clusterChip: {
    margin: theme.spacing(0.25),
    fontSize: '0.75rem',
  },
  alertBadge: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  statsContainer: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
}));

interface ClusterHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  nodes: {
    total: number;
    ready: number;
    notReady: number;
  };
  pods: {
    running: number;
    pending: number;
    failed: number;
  };
  cpu: {
    usage: number;
    limit: number;
  };
  memory: {
    usage: number;
    limit: number;
  };
  alerts: number;
}

interface InfrastructureMetrics {
  clusters: ClusterHealth[];
  overallHealth: {
    score: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  resources: {
    totalCpuCores: number;
    totalMemoryGb: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
  };
}

export const InfrastructureHealth: React.FC = () => {
  const classes = useStyles();
  const { config } = useDashboardConfig();
  const [metrics, setMetrics] = useState<InfrastructureMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className={classes.healthyStatus} />;
      case 'warning':
        return <WarningIcon className={classes.warningStatus} />;
      case 'critical':
        return <ErrorIcon className={classes.errorStatus} />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'critical':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#f44336'; // Red
    if (percentage >= 75) return '#ff9800'; // Orange
    if (percentage >= 50) return '#2196f3'; // Blue
    return '#4caf50'; // Green
  };

  // Simulated infrastructure data fetching
  // In real implementation, this would call Kubernetes API, Prometheus, etc.
  const fetchInfrastructureMetrics = useCallback(async () => {
    try {
      console.log('📊 Fetching infrastructure health metrics...');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock infrastructure data with realistic values
      const mockMetrics: InfrastructureMetrics = {
        clusters: [
          {
            name: 'ba-prod-cluster',
            status: 'healthy',
            nodes: {
              total: 12,
              ready: 11,
              notReady: 1,
            },
            pods: {
              running: 158,
              pending: 3,
              failed: 1,
            },
            cpu: {
              usage: 68,
              limit: 100,
            },
            memory: {
              usage: 72,
              limit: 100,
            },
            alerts: 2,
          },
          {
            name: 'ba-staging-cluster',
            status: 'warning',
            nodes: {
              total: 6,
              ready: 5,
              notReady: 1,
            },
            pods: {
              running: 84,
              pending: 2,
              failed: 0,
            },
            cpu: {
              usage: 45,
              limit: 100,
            },
            memory: {
              usage: 82,
              limit: 100,
            },
            alerts: 5,
          },
          {
            name: 'ba-dev-cluster',
            status: 'healthy',
            nodes: {
              total: 4,
              ready: 4,
              notReady: 0,
            },
            pods: {
              running: 42,
              pending: 0,
              failed: 0,
            },
            cpu: {
              usage: 28,
              limit: 100,
            },
            memory: {
              usage: 35,
              limit: 100,
            },
            alerts: 0,
          },
        ],
        overallHealth: {
          score: 87,
          status: 'healthy',
        },
        alerts: {
          critical: 1,
          warning: 6,
          info: 12,
        },
        resources: {
          totalCpuCores: 224,
          totalMemoryGb: 896,
          avgCpuUsage: 47,
          avgMemoryUsage: 63,
        },
      };

      setMetrics(mockMetrics);
      setError(null);

    } catch (err) {
      console.error('Error fetching infrastructure metrics:', err);
      setError('Failed to load infrastructure data');
    }
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      await fetchInfrastructureMetrics();
      setLoading(false);
      setLastRefresh(new Date());
    };

    loadMetrics();

    // Refresh every 3 minutes
    const interval = setInterval(loadMetrics, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchInfrastructureMetrics]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchInfrastructureMetrics();
    setLoading(false);
    setLastRefresh(new Date());
  };

  if (loading && !metrics) {
    return (
      <InfoCard
        title="📊 Infrastructure Health"
        icon={<CloudIcon />}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Box display="flex" justifyContent="center" alignItems="center" height={250}>
          <CircularProgress />
          <Typography variant="body2" style={{ marginLeft: 16 }}>
            Loading infrastructure metrics...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error || !metrics) {
    return (
      <InfoCard
        title="📊 Infrastructure Health"
        icon={<CloudIcon />}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Box p={2} textAlign="center">
          <Typography variant="body2" color="error">
            {error || 'No infrastructure data available'}
          </Typography>
          <Typography variant="caption" display="block" style={{ marginTop: 8 }}>
            Connect to Kubernetes API and monitoring systems
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title="📊 Infrastructure Health"
      icon={<CloudIcon />}
      action={
        <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
          <IconButton size="small" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      }
    >
      <Box>
        {/* Overall Health Summary */}
        <Box className={classes.statsContainer}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" style={{ color: getStatusColor(metrics.overallHealth.status) }}>
                  {metrics.overallHealth.score}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Health Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h5" color="textPrimary">
                  {metrics.clusters.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Clusters
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h5" color="error">
                  {metrics.alerts.critical}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Critical Alerts
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h5" style={{ color: '#ff9800' }}>
                  {metrics.alerts.warning}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Warnings
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Resource Overview */}
        <Grid container spacing={2} style={{ marginBottom: 16 }}>
          <Grid item xs={6}>
            <Card className={classes.healthCard}>
              <Box display="flex" alignItems="center" gap={1}>
                <MemoryIcon color="primary" />
                <Box flex={1}>
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    Average CPU Usage
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography className={classes.metricValue} style={{ color: getUsageColor(metrics.resources.avgCpuUsage) }}>
                      {metrics.resources.avgCpuUsage}%
                    </Typography>
                    <Typography variant="caption">
                      ({metrics.resources.totalCpuCores} cores)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.resources.avgCpuUsage}
                    className={classes.progressBar}
                    style={{ backgroundColor: '#e0e0e0' }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card className={classes.healthCard}>
              <Box display="flex" alignItems="center" gap={1}>
                <StorageIcon color="secondary" />
                <Box flex={1}>
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    Average Memory Usage
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography className={classes.metricValue} style={{ color: getUsageColor(metrics.resources.avgMemoryUsage) }}>
                      {metrics.resources.avgMemoryUsage}%
                    </Typography>
                    <Typography variant="caption">
                      ({metrics.resources.totalMemoryGb}GB)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.resources.avgMemoryUsage}
                    className={classes.progressBar}
                    color="secondary"
                    style={{ backgroundColor: '#e0e0e0' }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Cluster Details */}
        <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
          Cluster Status
        </Typography>
        <List dense>
          {metrics.clusters.map((cluster, index) => (
            <React.Fragment key={cluster.name}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar style={{ backgroundColor: 'transparent' }}>
                    {getStatusIcon(cluster.status)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        {cluster.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={cluster.status}
                          size="small"
                          style={{
                            backgroundColor: `${getStatusColor(cluster.status)}20`,
                            color: getStatusColor(cluster.status),
                            fontWeight: 'bold',
                          }}
                          className={classes.clusterChip}
                        />
                        {cluster.alerts > 0 && (
                          <Tooltip title={`${cluster.alerts} active alerts`}>
                            <Box className={classes.alertBadge}>
                              {cluster.alerts}
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Grid container spacing={2} style={{ marginTop: 4 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">
                            📦 Pods: {cluster.pods.running} running, {cluster.pods.pending} pending
                            {cluster.pods.failed > 0 && `, ${cluster.pods.failed} failed`}
                          </Typography>
                          <Typography variant="caption" display="block">
                            🖥️ Nodes: {cluster.nodes.ready}/{cluster.nodes.total} ready
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">
                            💾 CPU: {cluster.cpu.usage}% used
                          </Typography>
                          <Typography variant="caption" display="block">
                            🧠 Memory: {cluster.memory.usage}% used
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box display="flex" gap={1} style={{ marginTop: 8 }}>
                        <LinearProgress
                          variant="determinate"
                          value={cluster.cpu.usage}
                          style={{ flex: 1, height: 4, borderRadius: 2 }}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={cluster.memory.usage}
                          color="secondary"
                          style={{ flex: 1, height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < metrics.clusters.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </InfoCard>
  );
};