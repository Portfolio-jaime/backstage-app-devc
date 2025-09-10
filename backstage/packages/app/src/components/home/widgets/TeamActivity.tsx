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

export const TeamActivity = () => {
  const classes = useStyles();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lista de repositorios de BA para monitorear
  const baRepos = [
    'Portfolio-jaime/backstage-solutions',
    'Portfolio-jaime/Go-app-1',
    'Portfolio-jaime/python-app-20',
    'Portfolio-jaime/cli-go-11',
    'Portfolio-jaime/gitops',
    'Portfolio-jaime/terra-test-terraform-module',
    'Portfolio-jaime/vpc-terraform-module'
  ];

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
    const fetchGitHubActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar la API pública de GitHub para eventos de repos
        const promises = baRepos.slice(0, 3).map(async (repo) => {
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
        
        // Fallback a datos mock si falla la API
        setActivities([
          {
            user: 'GitHub API',
            action: 'rate limited - showing demo data',
            repo: 'backstage-solutions',
            timestamp: 'just now',
            type: 'info',
            avatar: 'GH',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubActivity();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchGitHubActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
    <InfoCard title="Team Activity Feed (Live GitHub)" icon={<GroupIcon />}>
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
          🔄 Auto-refreshes every 5 minutes • Live from GitHub API
        </Typography>
      </Box>
    </InfoCard>
  );
};