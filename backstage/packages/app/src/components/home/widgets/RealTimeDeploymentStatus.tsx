import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
  Avatar,
  Tooltip,
  Button,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  PlayArrow as RunningIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
  Cloud as CloudIcon,
} from '@material-ui/icons';
import { InfoCard } from '@backstage/core-components';

const useStyles = makeStyles((theme) => ({
  deploymentCard: {
    marginBottom: theme.spacing(1),
    border: '1px solid var(--theme-border, ' + theme.palette.divider + ')',
    backgroundColor: 'var(--theme-surface, ' + theme.palette.background.paper + ')',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  statusChip: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
  },
  successChip: {
    backgroundColor: 'var(--theme-success, #4caf50)',
    color: 'white',
  },
  errorChip: {
    backgroundColor: 'var(--theme-error, #f44336)',
    color: 'white',
  },
  runningChip: {
    backgroundColor: 'var(--theme-primary, #2196f3)',
    color: 'white',
  },
  pendingChip: {
    backgroundColor: 'var(--theme-warning, #ff9800)',
    color: 'white',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: theme.spacing(1),
  },
  environmentBadge: {
    fontSize: '0.65rem',
    height: 18,
    minWidth: 45,
  },
  timeStamp: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

interface DeploymentData {
  id: string;
  service: string;
  environment: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  progress?: number;
  branch: string;
  commit: string;
  author: string;
  startedAt: string;
  duration?: string;
  url?: string;
  source: 'github' | 'jenkins' | 'argocd';
}

// Mock data - en producción esto vendría de APIs reales
const mockDeployments: DeploymentData[] = [
  {
    id: '1',
    service: 'backstage-app',
    environment: 'PROD',
    status: 'success',
    branch: 'main',
    commit: 'a5e2e5c',
    author: 'jaime.henao',
    startedAt: '2 minutes ago',
    duration: '4m 32s',
    url: 'https://github.com/Portfolio-jaime/backstage-app/actions/runs/123',
    source: 'github',
  },
  {
    id: '2',
    service: 'api-gateway',
    environment: 'STG',
    status: 'running',
    progress: 65,
    branch: 'feature/api-improvements',
    commit: '4e2319a',
    author: 'devops1',
    startedAt: '5 minutes ago',
    url: 'https://github.com/Portfolio-jaime/api-gateway/actions/runs/124',
    source: 'github',
  },
  {
    id: '3',
    service: 'payment-service',
    environment: 'DEV',
    status: 'failed',
    branch: 'hotfix/payment-bug',
    commit: '74f05bb',
    author: 'devops2',
    startedAt: '12 minutes ago',
    duration: '2m 15s',
    url: 'https://jenkins.ba.com/job/payment-service/123',
    source: 'jenkins',
  },
  {
    id: '4',
    service: 'user-service',
    environment: 'DEV',
    status: 'pending',
    branch: 'main',
    commit: 'c2d204e',
    author: 'jaime.henao',
    startedAt: 'queued',
    url: 'https://argocd.ba.com/applications/user-service',
    source: 'argocd',
  },
];

export const RealTimeDeploymentStatus: React.FC = () => {
  const classes = useStyles();
  const [deployments, setDeployments] = useState<DeploymentData[]>(mockDeployments);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setDeployments(current =>
        current.map(deployment => {
          // Simular progreso para deployments en ejecución
          if (deployment.status === 'running' && deployment.progress !== undefined) {
            const newProgress = Math.min(deployment.progress + Math.random() * 10, 95);
            if (newProgress >= 95 && Math.random() > 0.7) {
              return {
                ...deployment,
                status: Math.random() > 0.2 ? 'success' : 'failed',
                progress: undefined,
                duration: `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
              };
            }
            return { ...deployment, progress: newProgress };
          }

          // Simular cambio de pending a running
          if (deployment.status === 'pending' && Math.random() > 0.8) {
            return {
              ...deployment,
              status: 'running',
              progress: 5,
              startedAt: 'just now',
            };
          }

          return deployment;
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon />;
      case 'failed':
        return <ErrorIcon />;
      case 'running':
        return <RunningIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusChip = (status: string) => {
    const baseClasses = `${classes.statusChip}`;
    switch (status) {
      case 'success':
        return `${baseClasses} ${classes.successChip}`;
      case 'failed':
        return `${baseClasses} ${classes.errorChip}`;
      case 'running':
        return `${baseClasses} ${classes.runningChip}`;
      case 'pending':
        return `${baseClasses} ${classes.pendingChip}`;
      default:
        return baseClasses;
    }
  };

  const getEnvironmentColor = (environment: string): 'primary' | 'secondary' | 'default' => {
    switch (environment.toUpperCase()) {
      case 'PROD':
        return 'secondary';
      case 'STG':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'github':
        return <GitHubIcon fontSize="small" />;
      case 'jenkins':
      case 'argocd':
        return <CloudIcon fontSize="small" />;
      default:
        return <CloudIcon fontSize="small" />;
    }
  };

  return (
    <InfoCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <RunningIcon />
            <span>Real-time Deployments</span>
            <Chip
              label={deployments.length}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Box className={classes.headerActions}>
            <Typography variant="caption" className={classes.timeStamp}>
              Last update: {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Tooltip title="Refresh deployments">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
    >
      <Box p={1}>
        {deployments.length === 0 ? (
          <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
            No active deployments
          </Typography>
        ) : (
          deployments.map((deployment) => (
            <Card key={deployment.id} className={classes.deploymentCard}>
              <CardContent style={{ padding: '12px 16px' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Avatar style={{ width: 20, height: 20 }}>
                        {getSourceIcon(deployment.source)}
                      </Avatar>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {deployment.service}
                      </Typography>
                      <Chip
                        label={deployment.environment}
                        size="small"
                        color={getEnvironmentColor(deployment.environment)}
                        className={classes.environmentBadge}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {deployment.branch} • {deployment.commit} • by {deployment.author}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={getStatusIcon(deployment.status)}
                        label={deployment.status.toUpperCase()}
                        className={getStatusChip(deployment.status)}
                      />
                      <Typography variant="caption" className={classes.timeStamp}>
                        {deployment.duration || deployment.startedAt}
                      </Typography>
                    </Box>

                    {deployment.progress !== undefined && (
                      <Box mt={1}>
                        <LinearProgress
                          variant="determinate"
                          value={deployment.progress}
                          className={classes.progressBar}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {deployment.progress.toFixed(0)}% complete
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Box display="flex" justifyContent="flex-end">
                      {deployment.url && (
                        <Tooltip title={`Open in ${deployment.source}`}>
                          <IconButton
                            size="small"
                            onClick={() => window.open(deployment.url, '_blank')}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}

        <Box mt={2} textAlign="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<LaunchIcon />}
            onClick={() => window.open('/catalog?filters=tag:deployment', '_blank')}
          >
            View All Deployments
          </Button>
        </Box>
      </Box>
    </InfoCard>
  );
};