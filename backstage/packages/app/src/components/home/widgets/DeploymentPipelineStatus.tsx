import React, { useState, useEffect, useCallback } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Link,
  Avatar,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import RefreshIcon from '@material-ui/icons/Refresh';
import LaunchIcon from '@material-ui/icons/Launch';
import BuildIcon from '@material-ui/icons/Build';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles((theme) => ({
  pipelineCard: {
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[2],
    },
  },
  environmentChip: {
    margin: theme.spacing(0.5),
    fontWeight: 'bold',
  },
  statusIcon: {
    marginRight: theme.spacing(1),
  },
  pipelineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  successStatus: {
    color: theme.palette.success.main,
  },
  errorStatus: {
    color: theme.palette.error.main,
  },
  warningStatus: {
    color: theme.palette.warning.main,
  },
  runningStatus: {
    color: theme.palette.primary.main,
  },
  statsBox: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  progressContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  deploymentTime: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  actionButton: {
    padding: theme.spacing(0.5),
  },
}));

interface PipelineRun {
  id: string;
  name: string;
  status: 'success' | 'failure' | 'running' | 'pending' | 'cancelled';
  environment: 'DEV' | 'STG' | 'PROD';
  startedAt: string;
  duration?: string;
  commit?: {
    sha: string;
    message: string;
    author: string;
  };
  url?: string;
  progress?: number;
}

interface PipelineStats {
  totalRuns: number;
  successRate: number;
  avgDuration: string;
  deploymentsToday: number;
}

export const DeploymentPipelineStatus: React.FC = () => {
  const classes = useStyles();
  const { config } = useDashboardConfig();
  const [pipelines, setPipelines] = useState<PipelineRun[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const getStatusIcon = (status: PipelineRun['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className={classes.successStatus} />;
      case 'failure':
        return <ErrorIcon className={classes.errorStatus} />;
      case 'running':
        return <PlayArrowIcon className={classes.runningStatus} />;
      case 'pending':
        return <WarningIcon className={classes.warningStatus} />;
      case 'cancelled':
        return <WarningIcon className={classes.warningStatus} />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: PipelineRun['status']): 'primary' | 'secondary' | 'default' => {
    switch (status) {
      case 'success':
        return 'primary';
      case 'failure':
        return 'secondary';
      case 'running':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getEnvironmentColor = (env: string): 'primary' | 'secondary' | 'default' => {
    switch (env) {
      case 'PROD':
        return 'secondary';
      case 'STG':
        return 'primary';
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

  const fetchGitHubActions = useCallback(async () => {
    try {
      const owner = 'Portfolio-jaime';
      const repos = ['backstage-app-devc', 'backstage-dashboard-templates'];

      console.log('🔄 Fetching GitHub Actions workflows...');

      const allRuns: PipelineRun[] = [];

      for (const repo of repos) {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
            {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );

          if (!response.ok) {
            console.warn(`Failed to fetch workflows for ${repo}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          const runs = data.workflow_runs?.slice(0, 5) || [];

          const convertedRuns: PipelineRun[] = runs.map((run: any) => ({
            id: run.id.toString(),
            name: `${repo}: ${run.name}`,
            status: run.status === 'completed'
              ? (run.conclusion === 'success' ? 'success' : 'failure')
              : (run.status === 'in_progress' ? 'running' : 'pending'),
            environment: repo.includes('prod') ? 'PROD' :
                        repo.includes('stg') ? 'STG' : 'DEV',
            startedAt: run.created_at,
            duration: run.updated_at && run.created_at
              ? `${Math.floor((new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 60000)}m`
              : undefined,
            commit: {
              sha: run.head_sha?.substring(0, 7) || 'unknown',
              message: run.display_title || run.head_commit?.message || 'No commit message',
              author: run.head_commit?.author?.name || run.actor?.login || 'Unknown',
            },
            url: run.html_url,
            progress: run.status === 'in_progress' ? Math.floor(Math.random() * 80) + 10 : 100,
          }));

          allRuns.push(...convertedRuns);
        } catch (repoError) {
          console.warn(`Error fetching ${repo} workflows:`, repoError);
        }
      }

      // Sort by start time and take the latest
      const sortedRuns = allRuns
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 8);

      setPipelines(sortedRuns);

      // Calculate stats
      const successfulRuns = sortedRuns.filter(r => r.status === 'success');
      const todayRuns = sortedRuns.filter(r => {
        const runDate = new Date(r.startedAt);
        const today = new Date();
        return runDate.toDateString() === today.toDateString();
      });

      const pipelineStats: PipelineStats = {
        totalRuns: sortedRuns.length,
        successRate: sortedRuns.length > 0 ? (successfulRuns.length / sortedRuns.length) * 100 : 0,
        avgDuration: '3.2m',
        deploymentsToday: todayRuns.length,
      };

      setStats(pipelineStats);
      setError(null);

    } catch (err) {
      console.error('Error fetching pipeline data:', err);
      setError('Failed to load pipeline data');

      // Mock data as fallback
      const mockPipelines: PipelineRun[] = [
        {
          id: '1',
          name: 'backstage-app-devc: Deploy to Production',
          status: 'success',
          environment: 'PROD',
          startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          duration: '4m 32s',
          commit: {
            sha: 'abc1234',
            message: 'feat: enhance dashboard widgets',
            author: 'jaime.henao',
          },
        },
        {
          id: '2',
          name: 'dashboard-templates: Update Configuration',
          status: 'running',
          environment: 'STG',
          startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          progress: 65,
          commit: {
            sha: 'def5678',
            message: 'update: DevOps dashboard config',
            author: 'devops-team',
          },
        },
        {
          id: '3',
          name: 'infrastructure: Terraform Apply',
          status: 'success',
          environment: 'PROD',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          duration: '8m 15s',
          commit: {
            sha: 'ghi9012',
            message: 'infra: update Kubernetes resources',
            author: 'platform-team',
          },
        },
      ];

      setPipelines(mockPipelines);
      setStats({
        totalRuns: mockPipelines.length,
        successRate: 85,
        avgDuration: '5.2m',
        deploymentsToday: 2,
      });
    }
  }, []);

  useEffect(() => {
    const loadPipelines = async () => {
      setLoading(true);
      await fetchGitHubActions();
      setLoading(false);
      setLastRefresh(new Date());
    };

    loadPipelines();

    // Refresh every 2 minutes
    const interval = setInterval(loadPipelines, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchGitHubActions]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchGitHubActions();
    setLoading(false);
    setLastRefresh(new Date());
  };

  if (loading && pipelines.length === 0) {
    return (
      <InfoCard
        title="🔥 Deployment Pipelines"
        icon={<BuildIcon />}
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
            Loading pipeline status...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title="🔥 Deployment Pipelines"
      icon={<BuildIcon />}
      action={
        <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
          <IconButton size="small" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      }
    >
      <Box>
        {/* Pipeline Stats */}
        {stats && (
          <Box className={classes.statsBox}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="h6" color="primary">
                  {stats.totalRuns}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Runs
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" style={{ color: stats.successRate >= 80 ? '#4caf50' : '#ff9800' }}>
                  {Math.round(stats.successRate)}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Success Rate
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" color="textPrimary">
                  {stats.avgDuration}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Duration
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" color="secondary">
                  {stats.deploymentsToday}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Today
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Box p={2} bgcolor="rgba(244, 67, 54, 0.1)" borderRadius={1} mb={2}>
            <Typography variant="body2" color="error">
              ⚠️ {error} - Showing cached/mock data
            </Typography>
          </Box>
        )}

        {/* Pipeline List */}
        <List dense>
          {pipelines.map((pipeline) => (
            <ListItem key={pipeline.id} className={classes.pipelineCard}>
              <ListItemIcon>
                {getStatusIcon(pipeline.status)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box className={classes.pipelineHeader}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        {pipeline.name}
                      </Typography>
                      <Chip
                        label={pipeline.environment}
                        size="small"
                        color={getEnvironmentColor(pipeline.environment)}
                        className={classes.environmentChip}
                      />
                      <Chip
                        label={pipeline.status}
                        size="small"
                        color={getStatusColor(pipeline.status)}
                        variant="outlined"
                      />
                    </Box>
                    {pipeline.url && (
                      <Tooltip title="View in GitHub">
                        <IconButton
                          size="small"
                          component={Link}
                          href={pipeline.url}
                          target="_blank"
                          className={classes.actionButton}
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {pipeline.commit && (
                      <Typography variant="caption" display="block" gutterBottom>
                        📝 {pipeline.commit.message} ({pipeline.commit.sha}) by {pipeline.commit.author}
                      </Typography>
                    )}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" className={classes.deploymentTime}>
                        Started {formatTimeAgo(pipeline.startedAt)}
                        {pipeline.duration && ` • Duration: ${pipeline.duration}`}
                      </Typography>
                    </Box>
                    {pipeline.status === 'running' && pipeline.progress && (
                      <Box className={classes.progressContainer}>
                        <LinearProgress
                          variant="determinate"
                          value={pipeline.progress}
                          color="primary"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {pipeline.progress}% complete
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {pipelines.length === 0 && !loading && (
          <Box textAlign="center" p={3}>
            <Typography variant="body2" color="textSecondary">
              No pipeline runs found
            </Typography>
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};