import React, { useState, useEffect, useCallback } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EnvironmentIcon from '@material-ui/icons/Public';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import RefreshIcon from '@material-ui/icons/Refresh';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import RestoreIcon from '@material-ui/icons/Restore';
import LaunchIcon from '@material-ui/icons/Launch';
import BuildIcon from '@material-ui/icons/Build';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles((theme) => ({
  environmentCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  healthyEnv: {
    borderLeft: `4px solid ${theme.palette.success.main}`,
    backgroundColor: `${theme.palette.success.main}05`,
  },
  warningEnv: {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
    backgroundColor: `${theme.palette.warning.main}05`,
  },
  criticalEnv: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
    backgroundColor: `${theme.palette.error.main}05`,
  },
  deployingEnv: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: `${theme.palette.primary.main}05`,
  },
  envHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  envName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  statusChip: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
  },
  deployInfo: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  actionButtons: {
    marginTop: theme.spacing(1),
    display: 'flex',
    gap: theme.spacing(1),
  },
  quickActionButton: {
    padding: theme.spacing(0.5, 1),
    fontSize: '0.75rem',
  },
  progressContainer: {
    marginTop: theme.spacing(1),
  },
  statsGrid: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
}));

interface Environment {
  id: string;
  name: string;
  displayName: string;
  status: 'healthy' | 'warning' | 'critical' | 'deploying' | 'maintenance';
  health: {
    score: number;
    uptime: number;
    responseTime: number;
  };
  deployment: {
    version: string;
    deployedAt: string;
    deployedBy: string;
    commitSha?: string;
    inProgress?: boolean;
    progress?: number;
  };
  services: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  urls: {
    app?: string;
    monitoring?: string;
    logs?: string;
  };
}

interface EnvironmentStatusData {
  environments: Environment[];
  summary: {
    totalEnvironments: number;
    healthyEnvironments: number;
    deploymentsToday: number;
    avgUptime: number;
  };
}

export const EnvironmentStatusBoard: React.FC = () => {
  const classes = useStyles();
  const { config } = useDashboardConfig();
  const [data, setData] = useState<EnvironmentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string;
    environment?: Environment;
  }>({ open: false, action: '' });

  const getStatusIcon = (status: Environment['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
      case 'warning':
        return <WarningIcon style={{ color: '#ff9800' }} />;
      case 'critical':
        return <ErrorIcon style={{ color: '#f44336' }} />;
      case 'deploying':
        return <BuildIcon style={{ color: '#2196f3' }} />;
      case 'maintenance':
        return <StopIcon style={{ color: '#9e9e9e' }} />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusClass = (status: Environment['status']) => {
    switch (status) {
      case 'healthy':
        return classes.healthyEnv;
      case 'warning':
        return classes.warningEnv;
      case 'critical':
        return classes.criticalEnv;
      case 'deploying':
        return classes.deployingEnv;
      default:
        return classes.warningEnv;
    }
  };

  const getStatusColor = (status: Environment['status']): 'primary' | 'secondary' | 'default' => {
    switch (status) {
      case 'healthy':
        return 'primary';
      case 'deploying':
        return 'primary';
      case 'warning':
      case 'critical':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const fetchEnvironmentStatus = useCallback(async () => {
    try {
      console.log('🌍 Fetching environment status...');

      // Mock environment data - in real implementation, this would call your deployment APIs
      const mockData: EnvironmentStatusData = {
        environments: [
          {
            id: 'prod1',
            name: 'PROD1',
            displayName: 'Production Primary',
            status: 'healthy',
            health: {
              score: 98,
              uptime: 99.9,
              responseTime: 125,
            },
            deployment: {
              version: 'v2.3.1',
              deployedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              deployedBy: 'jaime.henao',
              commitSha: 'abc1234',
            },
            services: {
              total: 24,
              healthy: 23,
              unhealthy: 1,
            },
            urls: {
              app: 'https://prod1.ba.com',
              monitoring: 'https://grafana.ba.com/prod1',
              logs: 'https://logs.ba.com/prod1',
            },
          },
          {
            id: 'stg1',
            name: 'STG1',
            displayName: 'Staging Environment',
            status: 'deploying',
            health: {
              score: 85,
              uptime: 98.5,
              responseTime: 180,
            },
            deployment: {
              version: 'v2.4.0-beta',
              deployedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              deployedBy: 'devops-team',
              commitSha: 'def5678',
              inProgress: true,
              progress: 75,
            },
            services: {
              total: 20,
              healthy: 18,
              unhealthy: 2,
            },
            urls: {
              app: 'https://staging.ba.com',
              monitoring: 'https://grafana.ba.com/staging',
              logs: 'https://logs.ba.com/staging',
            },
          },
          {
            id: 'dev1',
            name: 'DEV1',
            displayName: 'Development Environment',
            status: 'healthy',
            health: {
              score: 92,
              uptime: 97.2,
              responseTime: 95,
            },
            deployment: {
              version: 'v2.4.0-dev',
              deployedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              deployedBy: 'developer1',
              commitSha: 'ghi9012',
            },
            services: {
              total: 15,
              healthy: 15,
              unhealthy: 0,
            },
            urls: {
              app: 'https://dev.ba.com',
              monitoring: 'https://grafana.ba.com/dev',
              logs: 'https://logs.ba.com/dev',
            },
          },
          {
            id: 'uat1',
            name: 'UAT1',
            displayName: 'User Acceptance Testing',
            status: 'warning',
            health: {
              score: 78,
              uptime: 95.8,
              responseTime: 350,
            },
            deployment: {
              version: 'v2.3.1',
              deployedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              deployedBy: 'qa-team',
              commitSha: 'jkl3456',
            },
            services: {
              total: 18,
              healthy: 15,
              unhealthy: 3,
            },
            urls: {
              app: 'https://uat.ba.com',
              monitoring: 'https://grafana.ba.com/uat',
              logs: 'https://logs.ba.com/uat',
            },
          },
        ],
        summary: {
          totalEnvironments: 4,
          healthyEnvironments: 3,
          deploymentsToday: 5,
          avgUptime: 97.85,
        },
      };

      setData(mockData);
      setError(null);

    } catch (err) {
      console.error('Error fetching environment status:', err);
      setError('Failed to load environment status');
    }
  }, []);

  useEffect(() => {
    const loadEnvironmentStatus = async () => {
      setLoading(true);
      await fetchEnvironmentStatus();
      setLoading(false);
      setLastRefresh(new Date());
    };

    loadEnvironmentStatus();

    // Refresh every 2 minutes
    const interval = setInterval(loadEnvironmentStatus, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEnvironmentStatus]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchEnvironmentStatus();
    setLoading(false);
    setLastRefresh(new Date());
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, environment: Environment) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEnv(environment);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedEnv(null);
  };

  const handleQuickAction = (action: string, environment: Environment) => {
    setActionDialog({ open: true, action, environment });
    handleActionClose();
  };

  const executeAction = () => {
    // In real implementation, this would call deployment APIs
    console.log(`Executing ${actionDialog.action} on ${actionDialog.environment?.name}`);
    setActionDialog({ open: false, action: '' });
    // Refresh data after action
    handleRefresh();
  };

  if (loading && !data) {
    return (
      <InfoCard
        title="🔄 Environment Status Board"
        icon={<EnvironmentIcon />}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
          <Typography variant="body2" style={{ marginLeft: 16 }}>
            Loading environment status...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error || !data) {
    return (
      <InfoCard
        title="🔄 Environment Status Board"
        icon={<EnvironmentIcon />}
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
            {error || 'No environment data available'}
          </Typography>
          <Typography variant="caption" display="block" style={{ marginTop: 8 }}>
            Connect to deployment and monitoring systems
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <>
      <InfoCard
        title="🔄 Environment Status Board"
        icon={<EnvironmentIcon />}
        action={
          <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        }
      >
        <Box>
          {/* Summary Stats */}
          <Grid container spacing={2} className={classes.statsGrid}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {data.summary.totalEnvironments}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Environments
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" style={{ color: '#4caf50' }}>
                  {data.summary.healthyEnvironments}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Healthy
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="secondary">
                  {data.summary.deploymentsToday}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Deployments Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="textPrimary">
                  {data.summary.avgUptime}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Uptime
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Environment Cards */}
          <Grid container spacing={2}>
            {data.environments.map((env) => (
              <Grid item xs={12} md={6} key={env.id}>
                <Card className={`${classes.environmentCard} ${getStatusClass(env.status)}`}>
                  <CardContent style={{ padding: '12px 16px' }}>
                    <Box className={classes.envHeader}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(env.status)}
                        <Typography className={classes.envName}>
                          {env.displayName}
                        </Typography>
                        <Chip
                          label={env.status}
                          size="small"
                          color={getStatusColor(env.status)}
                          className={classes.statusChip}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, env)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Health Metrics */}
                    <Grid container spacing={1} style={{ marginBottom: 8 }}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Health: {env.health.score}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Uptime: {env.health.uptime}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Response: {env.health.responseTime}ms
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Deployment Info */}
                    <Box className={classes.deployInfo}>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        Version: {env.deployment.version}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Deployed {formatTimeAgo(env.deployment.deployedAt)} by {env.deployment.deployedBy}
                      </Typography>
                      {env.deployment.commitSha && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          Commit: {env.deployment.commitSha}
                        </Typography>
                      )}

                      {env.deployment.inProgress && env.deployment.progress && (
                        <Box className={classes.progressContainer}>
                          <LinearProgress
                            variant="determinate"
                            value={env.deployment.progress}
                            style={{ marginBottom: 4 }}
                          />
                          <Typography variant="caption">
                            Deploying... {env.deployment.progress}% complete
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Services Status */}
                    <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 8 }}>
                      Services: {env.services.healthy}/{env.services.total} healthy
                      {env.services.unhealthy > 0 && (
                        <span style={{ color: '#f44336' }}> • {env.services.unhealthy} unhealthy</span>
                      )}
                    </Typography>

                    {/* Quick Actions */}
                    <Box className={classes.actionButtons}>
                      {env.urls.app && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LaunchIcon />}
                          href={env.urls.app}
                          target="_blank"
                          className={classes.quickActionButton}
                        >
                          App
                        </Button>
                      )}
                      {env.urls.monitoring && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LaunchIcon />}
                          href={env.urls.monitoring}
                          target="_blank"
                          className={classes.quickActionButton}
                        >
                          Monitor
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </InfoCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={() => selectedEnv && handleQuickAction('deploy', selectedEnv)}>
          <PlayArrowIcon fontSize="small" style={{ marginRight: 8 }} />
          Deploy Latest
        </MenuItem>
        <MenuItem onClick={() => selectedEnv && handleQuickAction('rollback', selectedEnv)}>
          <RestoreIcon fontSize="small" style={{ marginRight: 8 }} />
          Rollback
        </MenuItem>
        <MenuItem onClick={() => selectedEnv && handleQuickAction('restart', selectedEnv)}>
          <RefreshIcon fontSize="small" style={{ marginRight: 8 }} />
          Restart Services
        </MenuItem>
      </Menu>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, action: '' })}>
        <DialogTitle>
          Confirm {actionDialog.action} on {actionDialog.environment?.displayName}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionDialog.action} {actionDialog.environment?.displayName}?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This action will affect the running services in this environment.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: '' })}>
            Cancel
          </Button>
          <Button onClick={executeAction} color="primary" variant="contained">
            Confirm {actionDialog.action}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};