import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Box,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import GitHubIcon from '@material-ui/icons/GitHub';
import BuildIcon from '@material-ui/icons/Build';
import BugReportIcon from '@material-ui/icons/BugReport';
import PublishIcon from '@material-ui/icons/Publish';
import RefreshIcon from '@material-ui/icons/Refresh';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { useApi } from '@backstage/core-plugin-api';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  timestamp: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: '0.875rem',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: theme.spacing(1),
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  errorContainer: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing(1),
  },
  loadingMore: {
    textAlign: 'center',
    padding: theme.spacing(1),
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  refreshIcon: {
    animation: '$spin 1s linear infinite',
  },
}));

interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
    display_login?: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

interface Activity {
  user: string;
  action: string;
  repo: string;
  timestamp: string;
  type: string;
  avatar: string;
  avatarUrl?: string;
  details?: string;
  url?: string;
}

interface TeamActivityProps {
  refreshKey?: number;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  status: string;
}

export const TeamActivity: React.FC<TeamActivityProps> = ({ refreshKey = 0 }) => {
  const classes = useStyles();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    status: 'Initializing...'
  });
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { config, currentTemplate } = useDashboardConfig();

  // Configuración dinámica de repositorios
  const [baRepos, setBaRepos] = useState<string[]>([]);
  const [reposLoaded, setReposLoaded] = useState(false);
  
  // Función optimizada para cargar repositorios dinámicamente
  const loadDynamicRepos = useCallback(async () => {
    try {
      setLoadingState(prev => ({ ...prev, status: 'Loading repositories...', progress: 10 }));

      const owner = 'Portfolio-jaime';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=20`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const repos = await response.json();

        setLoadingState(prev => ({ ...prev, status: 'Filtering repositories...', progress: 30 }));

        // Obtener filtros específicos del dashboard actual
        const githubConfig = config?.spec?.widgets?.github;
        const keywords = githubConfig?.filters?.keywords || ['backstage', 'devops'];
        const topics = githubConfig?.filters?.topics || ['backstage', 'devops'];
        const maxRepos = githubConfig?.filters?.maxRepos || 8;

        // Filtrar repositorios relevantes con mejor lógica
        const relevantRepos = repos
          .filter((repo: any) => !repo.archived && !repo.private && repo.pushed_at)
          .filter((repo: any) => {
            const repoTopics = repo.topics || [];
            const name = repo.name.toLowerCase();
            const description = (repo.description || '').toLowerCase();

            const matchesTopics = repoTopics.some((topic: string) =>
              topics.some((configTopic: string) =>
                topic.toLowerCase().includes(configTopic.toLowerCase())
              )
            );

            const matchesKeywords = keywords.some((keyword: string) =>
              name.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase())
            );

            return matchesTopics || matchesKeywords;
          })
          .slice(0, maxRepos)
          .map((repo: any) => `${owner}/${repo.name}`);

        console.log(`🔍 Found ${relevantRepos.length} matching repos for ${currentTemplate?.name}:`, relevantRepos);
        setBaRepos(relevantRepos.length > 0 ? relevantRepos : [`${owner}/backstage-app-devc`]);
        setError(null);
        setRetryCount(0);
      } else {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }
    } catch (error: any) {
      console.warn('Error loading dynamic repos:', error.message);

      if (error.name === 'AbortError') {
        setError('Request timeout - using fallback repositories');
      } else {
        setError(`Failed to load repositories: ${error.message}`);
      }

      // Fallback repositories
      setBaRepos([
        'Portfolio-jaime/backstage-app-devc',
        'Portfolio-jaime/GitOps',
        'Portfolio-jaime/backstage-dashboard-templates'
      ]);
    } finally {
      setReposLoaded(true);
      setLoadingState(prev => ({ ...prev, progress: 50 }));
    }
  }, [config, currentTemplate]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Improved activity parsing with more details
  const getActivityFromEvent = useCallback((event: GitHubEvent): Activity | null => {
    const baseActivity = {
      user: event.actor.display_login || event.actor.login,
      repo: event.repo.name.split('/')[1] || event.repo.name,
      timestamp: formatTimeAgo(event.created_at),
      avatar: event.actor.login.substring(0, 2).toUpperCase(),
      avatarUrl: event.actor.avatar_url,
    };

    switch (event.type) {
      case 'PushEvent':
        const commits = event.payload.commits?.length || 1;
        const commitMessage = event.payload.commits?.[0]?.message || '';
        return {
          ...baseActivity,
          action: `pushed ${commits} commit${commits > 1 ? 's' : ''}`,
          type: 'commit',
          details: commitMessage ? `"${commitMessage.substring(0, 50)}${commitMessage.length > 50 ? '...' : ''}"` : undefined,
          url: `https://github.com/${event.repo.name}/commits/${event.payload.head}`,
        };
      case 'PullRequestEvent':
        const prAction = event.payload.action;
        const prTitle = event.payload.pull_request?.title || '';
        return {
          ...baseActivity,
          action: `${prAction} PR #${event.payload.number}`,
          type: prAction === 'merged' ? 'merge' : 'pr',
          details: prTitle ? `"${prTitle.substring(0, 50)}${prTitle.length > 50 ? '...' : ''}"` : undefined,
          url: event.payload.pull_request?.html_url,
        };
      case 'IssuesEvent':
        const issueTitle = event.payload.issue?.title || '';
        return {
          ...baseActivity,
          action: `${event.payload.action} issue #${event.payload.issue.number}`,
          type: 'issue',
          details: issueTitle ? `"${issueTitle.substring(0, 50)}${issueTitle.length > 50 ? '...' : ''}"` : undefined,
          url: event.payload.issue?.html_url,
        };
      case 'CreateEvent':
        return {
          ...baseActivity,
          action: `created ${event.payload.ref_type} ${event.payload.ref || ''}`,
          type: 'create',
          url: `https://github.com/${event.repo.name}`,
        };
      case 'ReleaseEvent':
        return {
          ...baseActivity,
          action: `released ${event.payload.release.tag_name}`,
          type: 'release',
          details: event.payload.release.name || undefined,
          url: event.payload.release.html_url,
        };
      default:
        return null;
    }
  }, []);

  useEffect(() => {
    // Cargar repos dinámicos cuando cambie la configuración o al hacer refresh
    if (config) {
      console.log('🔄 Refreshing repositories due to config change or manual refresh');
      loadDynamicRepos();
    }
  }, [config, currentTemplate, refreshKey]);

  useEffect(() => {
    if (!reposLoaded || baRepos.length === 0) return;

    const fetchGitHubActivity = useCallback(async () => {
      try {
        setLoadingState(prev => ({ ...prev, isLoading: true, status: 'Fetching GitHub activity...', progress: 60 }));
        setError(null);

        console.log('📡 Fetching activity for repos:', baRepos);

        const maxRepos = Math.min(baRepos.length, 6);
        const promises = baRepos.slice(0, maxRepos).map(async (repo, index) => {
          try {
            setLoadingState(prev => ({
              ...prev,
              status: `Loading ${repo} (${index + 1}/${maxRepos})...`,
              progress: 60 + (index / maxRepos) * 30
            }));

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`https://api.github.com/repos/${repo}/events`, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              if (response.status === 403) {
                console.warn(`Rate limited for ${repo}`);
                return [];
              }
              if (response.status === 404) {
                console.warn(`Repository ${repo} not found or private`);
                return [];
              }
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const events: GitHubEvent[] = await response.json();
            return events.slice(0, 5).map(getActivityFromEvent).filter(Boolean);

          } catch (err: any) {
            if (err.name === 'AbortError') {
              console.warn(`Timeout fetching events for ${repo}`);
            } else {
              console.warn(`Error fetching ${repo} events:`, err.message);
            }
            return [];
          }
        });

        const results = await Promise.allSettled(promises);
        const allActivities = results
          .filter((result): result is PromiseFulfilledResult<Activity[]> => result.status === 'fulfilled')
          .flatMap(result => result.value) as Activity[];

        // Ordenar por timestamp y tomar los primeros 8
        const sortedActivities = allActivities
          .sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
          })
          .slice(0, 8);

        setActivities(sortedActivities);
        setLastRefresh(new Date());
        setRetryCount(0);

      } catch (err: any) {
        console.error('Error fetching GitHub activity:', err);
        const errorMessage = `Unable to load GitHub activity: ${err.message}`;
        setError(errorMessage);

        // Enhanced fallback data with more context
        const now = new Date();
        const mockActivities: Activity[] = [
          {
            user: 'jaime.henao',
            action: 'pushed 3 commits',
            repo: 'backstage-app-devc',
            timestamp: formatTimeAgo(new Date(now.getTime() - 15 * 60 * 1000).toISOString()),
            type: 'commit',
            avatar: 'JH',
            avatarUrl: 'https://github.com/jaime.henao.png',
            details: '"feat: enhance dashboard widgets"',
          },
          {
            user: 'devops-team',
            action: 'merged PR #47',
            repo: 'kubernetes-manifests',
            timestamp: formatTimeAgo(new Date(now.getTime() - 45 * 60 * 1000).toISOString()),
            type: 'merge',
            avatar: 'DT',
            details: '"Update production deployment config"',
          },
          {
            user: 'jaime.henao',
            action: 'created release v2.1.0',
            repo: 'terraform-infrastructure',
            timestamp: formatTimeAgo(new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()),
            type: 'release',
            avatar: 'JH',
            avatarUrl: 'https://github.com/jaime.henao.png',
            details: 'Production Infrastructure Update',
          },
        ];

        console.log('📊 Using enhanced mock DevOps team activity data');
        setActivities(mockActivities);
      } finally {
        setLoadingState(prev => ({ ...prev, isLoading: false, progress: 100, status: 'Complete' }));
      }
    }, [baRepos, getActivityFromEvent]);

    fetchGitHubActivity();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchGitHubActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [reposLoaded, baRepos, refreshKey]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'merge':
        return <GitHubIcon style={{ color: '#4caf50' }} />;
      case 'deploy':
        return <PublishIcon style={{ color: '#2196f3' }} />;
      case 'issue':
        return <BugReportIcon style={{ color: '#ff9800' }} />;
      case 'build':
        return <BuildIcon style={{ color: '#9c27b0' }} />;
      case 'push':
        return <GitHubIcon style={{ color: '#4caf50' }} />;
      case 'update':
        return <BuildIcon style={{ color: '#00bcd4' }} />;
      case 'fix':
        return <BugReportIcon style={{ color: '#f44336' }} />;
      default:
        return <GitHubIcon style={{ color: '#666' }} />;
    }
  };

  const getChipColor = (type: string) => {
    switch (type) {
      case 'merge':
        return 'primary';
      case 'deploy':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    setRetryCount(prev => prev + 1);
    await loadDynamicRepos();
  }, [loadDynamicRepos]);

  // Enhanced loading state
  if (loadingState.isLoading) {
    return (
      <InfoCard
        title="GitHub Activity"
        icon={<GroupIcon />}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleManualRefresh} disabled={loadingState.isLoading}>
              <RefreshIcon className={loadingState.isLoading ? classes.refreshIcon : ''} />
            </IconButton>
          </Tooltip>
        }
      >
        <Box p={2}>
          <Box className={classes.progressContainer}>
            <LinearProgress
              variant="determinate"
              value={loadingState.progress}
              style={{ marginBottom: 16 }}
            />
            <Typography variant="body2" color="textSecondary" align="center">
              {loadingState.status}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
            <CircularProgress size={30} />
            <Typography variant="caption" style={{ marginLeft: 12 }}>
              Progress: {Math.round(loadingState.progress)}%
            </Typography>
          </Box>
        </Box>
      </InfoCard>
    );
  }

  // Enhanced error state with retry option
  if (error && activities.length === 0) {
    return (
      <InfoCard
        title="GitHub Activity"
        icon={<GroupIcon />}
        action={
          <Tooltip title="Retry">
            <IconButton size="small" onClick={handleManualRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Box className={classes.errorContainer}>
          <Alert
            severity="warning"
            icon={<ErrorOutlineIcon />}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleManualRefresh}
                className={classes.retryButton}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            <Typography variant="body2">
              {error}
            </Typography>
            <Typography variant="caption" display="block" style={{ marginTop: 4 }}>
              Retry attempt: {retryCount}/3 • Showing fallback data
            </Typography>
          </Alert>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title={config?.spec?.widgets?.github?.title || `GitHub Activity (${baRepos.length} repos)`}
      icon={<GroupIcon />}
      action={
        <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
          <IconButton size="small" onClick={handleManualRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      }
    >
      {/* Error banner for partial failures */}
      {error && activities.length > 0 && (
        <Alert severity="info" style={{ margin: '8px 16px' }}>
          <Typography variant="caption">
            Some repositories failed to load. Showing available data.
          </Typography>
        </Alert>
      )}

      <List dense>
        {activities.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography color="textSecondary">
              No recent activity found
            </Typography>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
              Repositories: {baRepos.join(', ').replace(/Portfolio-jaime\//g, '')}
            </Typography>
          </Box>
        ) : (
          activities.map((activity, index) => (
            <ListItem
              key={`${activity.user}-${activity.timestamp}-${index}`}
              className={classes.listItem}
              button={!!activity.url}
              component={activity.url ? "a" : "div"}
              href={activity.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemAvatar>
                <Avatar
                  className={classes.avatar}
                  src={activity.avatarUrl}
                  alt={activity.user}
                >
                  {!activity.avatarUrl && activity.avatar}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="body2">
                      <strong>{activity.user}</strong> {activity.action}
                    </Typography>
                    {activity.details && (
                      <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginTop: 2 }}>
                        {activity.details}
                      </Typography>
                    )}
                    <Box display="flex" alignItems="center" marginTop={1} style={{ gap: 8 }}>
                      {getIcon(activity.type)}
                      <Typography variant="body2" style={{ marginLeft: 4 }}>
                        {activity.repo}
                      </Typography>
                      <Chip
                        label={activity.type}
                        size="small"
                        color={getChipColor(activity.type) as any}
                        style={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                }
                secondary={
                  <Typography className={classes.timestamp}>
                    {activity.timestamp}
                  </Typography>
                }
              />
            </ListItem>
          ))
        )}
      </List>

      <Box mt={1} px={2} pb={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            🔄 Auto-refresh: 5min
          </Typography>
          <Typography variant="caption" color="primary">
            Repos: {baRepos.length} • Last: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        {retryCount > 0 && (
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
            ⚠️ Retry attempts: {retryCount}
          </Typography>
        )}
      </Box>
    </InfoCard>
  );
};