import React, { useState, useEffect } from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Chip, CircularProgress, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import GitHubIcon from '@material-ui/icons/GitHub';
import BuildIcon from '@material-ui/icons/Build';
import BugReportIcon from '@material-ui/icons/BugReport';
import PublishIcon from '@material-ui/icons/Publish';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { useApi } from '@backstage/core-plugin-api';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
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
}

interface TeamActivityProps {
  refreshKey?: number;
}

export const TeamActivity: React.FC<TeamActivityProps> = ({ refreshKey = 0 }) => {
  const classes = useStyles();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config, currentTemplate } = useDashboardConfig();
  
  // Configuración dinámica de repositorios
  const [baRepos, setBaRepos] = useState<string[]>([]);
  const [reposLoaded, setReposLoaded] = useState(false);
  
  // Función para cargar repositorios dinámicamente basado en la configuración del dashboard
  const loadDynamicRepos = async () => {
    try {
      const owner = 'Portfolio-jaime';
      const response = await fetch(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=20`);
      
      if (response.ok) {
        const repos = await response.json();
        
        // Obtener filtros específicos del dashboard actual
        const githubConfig = config?.spec?.widgets?.github;
        const keywords = githubConfig?.filters?.keywords || ['backstage', 'devops'];
        const topics = githubConfig?.filters?.topics || ['backstage', 'devops'];
        const maxRepos = githubConfig?.filters?.maxRepos || 8;
        
        console.log(`🎯 Filtering repos for ${currentTemplate?.name} dashboard:`, { keywords, topics });
        
        // Filtrar repositorios relevantes
        const relevantRepos = repos
          .filter((repo: any) => {
            // Filtrar solo repos públicos y no archivados
            return !repo.archived && !repo.private && repo.pushed_at;
          })
          .filter((repo: any) => {
            // Filtrar por temas relevantes o nombres usando la configuración del dashboard
            const repoTopics = repo.topics || [];
            const name = repo.name.toLowerCase();
            
            const matchesTopics = repoTopics.some((topic: string) => 
              topics.some((configTopic: string) => 
                topic.toLowerCase().includes(configTopic.toLowerCase())
              )
            );
            
            const matchesKeywords = keywords.some((keyword: string) => 
              name.includes(keyword.toLowerCase())
            );
            
            return matchesTopics || matchesKeywords;
          })
          .slice(0, maxRepos)
          .map((repo: any) => `${owner}/${repo.name}`);
        
        console.log(`🔍 Found ${relevantRepos.length} matching repos:`, relevantRepos);
        setBaRepos(relevantRepos.length > 0 ? relevantRepos : [`${owner}/backstage-app-devc`]); // Fallback
      } else {
        console.warn('Using fallback repos');
        setBaRepos([
          'Portfolio-jaime/backstage-app-devc',
          'Portfolio-jaime/GitOps',
          'Portfolio-jaime/backstage-dashboard-templates'
        ]);
      }
    } catch (error) {
      console.error('Error loading dynamic repos:', error);
      setBaRepos(['Portfolio-jaime/backstage-app-devc']);
    } finally {
      setReposLoaded(true);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getActivityFromEvent = (event: GitHubEvent): Activity | null => {
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
        return {
          ...baseActivity,
          action: `pushed ${commits} commit${commits > 1 ? 's' : ''}`,
          type: 'commit',
        };
      case 'PullRequestEvent':
        const prAction = event.payload.action;
        return {
          ...baseActivity,
          action: `${prAction} PR #${event.payload.number}`,
          type: prAction === 'merged' ? 'merge' : 'pr',
        };
      case 'IssuesEvent':
        return {
          ...baseActivity,
          action: `${event.payload.action} issue #${event.payload.issue.number}`,
          type: 'issue',
        };
      case 'CreateEvent':
        return {
          ...baseActivity,
          action: `created ${event.payload.ref_type} ${event.payload.ref || ''}`,
          type: 'create',
        };
      case 'ReleaseEvent':
        return {
          ...baseActivity,
          action: `released ${event.payload.release.tag_name}`,
          type: 'release',
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    // Cargar repos dinámicos cuando cambie la configuración o al hacer refresh
    if (config) {
      console.log('🔄 Refreshing repositories due to config change or manual refresh');
      loadDynamicRepos();
    }
  }, [config, currentTemplate, refreshKey]);

  useEffect(() => {
    if (!reposLoaded || baRepos.length === 0) return;

    const fetchGitHubActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📡 Fetching activity for repos:', baRepos);
        
        // Usar la API pública de GitHub para eventos de repos
        const promises = baRepos.slice(0, 6).map(async (repo) => {
          try {
            const response = await fetch(`https://api.github.com/repos/${repo}/events`, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                // Si tienes un token, puedes agregarlo aquí:
                // 'Authorization': `token ${githubToken}`,
              },
            });
            
            if (!response.ok) {
              console.warn(`Failed to fetch events for ${repo}: ${response.status}`);
              return [];
            }
            
            const events: GitHubEvent[] = await response.json();
            return events.slice(0, 5).map(getActivityFromEvent).filter(Boolean);
          } catch (err) {
            console.warn(`Error fetching ${repo} events:`, err);
            return [];
          }
        });

        const results = await Promise.all(promises);
        const allActivities = results.flat() as Activity[];
        
        // Ordenar por timestamp y tomar los primeros 8
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8);
        
        setActivities(sortedActivities);
      } catch (err) {
        console.error('Error fetching GitHub activity:', err);
        setError('Unable to load GitHub activity');
        
        // Fallback a datos mock con timestamps recientes si falla la API
        const now = new Date();
        const mockActivities = [
          {
            user: 'jaime.henao',
            action: 'pushed commits to',
            repo: 'backstage-app-devc',
            timestamp: formatTimeAgo(new Date(now.getTime() - 15 * 60 * 1000).toISOString()),
            type: 'push',
            avatar: 'JH',
            avatarUrl: 'https://github.com/jaime.henao.png'
          },
          {
            user: 'devops-team',
            action: 'updated deployment config in',
            repo: 'kubernetes-manifests',
            timestamp: formatTimeAgo(new Date(now.getTime() - 45 * 60 * 1000).toISOString()),
            type: 'deploy',
            avatar: 'DT',
          },
          {
            user: 'jaime.henao',
            action: 'merged pull request in',
            repo: 'terraform-infrastructure',
            timestamp: formatTimeAgo(new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()),
            type: 'merge',
            avatar: 'JH',
            avatarUrl: 'https://github.com/jaime.henao.png'
          },
          {
            user: 'devops1',
            action: 'updated monitoring dashboards in',
            repo: 'monitoring-stack',
            timestamp: formatTimeAgo(new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()),
            type: 'update',
            avatar: 'D1',
          },
          {
            user: 'devops2',
            action: 'fixed CI pipeline in',
            repo: 'ci-cd-pipelines',
            timestamp: formatTimeAgo(new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()),
            type: 'fix',
            avatar: 'D2',
          }
        ];

        console.log('📊 Using mock DevOps team activity data');
        setActivities(mockActivities);
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <InfoCard title="Team Activity Feed" icon={<GroupIcon />}>
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress size={40} />
          <Typography variant="body2" style={{ marginLeft: 16 }}>
            Loading GitHub activity...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Team Activity Feed" icon={<GroupIcon />}>
        <Box p={2} textAlign="center">
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Showing demo data instead
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard 
      title={config?.spec?.widgets?.github?.title || `GitHub Activity (${baRepos.length} repos)`} 
      icon={<GroupIcon />}
    >
      <List dense>
        {activities.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography color="textSecondary">
              No recent activity found
            </Typography>
          </Box>
        ) : (
          activities.map((activity, index) => (
            <ListItem key={index} className={classes.listItem}>
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
                  <div>
                    <Typography variant="body2">
                      <strong>{activity.user}</strong> {activity.action}
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      {getIcon(activity.type)}
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        {activity.repo}
                      </Typography>
                      <Chip 
                        label={activity.type} 
                        size="small" 
                        style={{ marginLeft: 8 }}
                        color={getChipColor(activity.type) as any}
                      />
                    </div>
                  </div>
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
      <Box mt={1} textAlign="center">
        <Typography variant="caption" color="primary">
          🔄 Auto-refreshes every 5 minutes • Dynamic repos: {baRepos.join(', ').replace(/Portfolio-jaime\//g, '')}
        </Typography>
      </Box>
    </InfoCard>
  );
};