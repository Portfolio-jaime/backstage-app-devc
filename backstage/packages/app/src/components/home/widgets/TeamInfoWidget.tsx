import React, { useState, useEffect } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton,
  Badge
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import AssignmentIcon from '@material-ui/icons/Assignment';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import ChatIcon from '@material-ui/icons/Chat';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import RefreshIcon from '@material-ui/icons/Refresh';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles(theme => ({
  teamHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    marginBottom: theme.spacing(2),
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  memberCard: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  expertise: {
    margin: theme.spacing(0.5),
  },
  metricCard: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  metricProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  metricValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  metricLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  metricTrend: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(0.5),
  },
  toolChip: {
    margin: theme.spacing(0.25),
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  onlineAvatar: {
    border: `2px solid ${theme.palette.success.main}`,
  },
  offlineAvatar: {
    border: `2px solid ${theme.palette.grey[400]}`,
  },
  statusBadge: {
    '& .MuiBadge-badge': {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.main,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
  healthStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  refreshButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

interface TeamMember {
  name: string;
  role: string;
  email: string;
  expertise: string[];
  status?: 'online' | 'offline' | 'away';
  timezone?: string;
}

interface TeamMetric {
  value: string;
  target?: string;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
}

interface TeamInfo {
  name: string;
  displayName: string;
  description: string;
  lead: string;
  members: TeamMember[];
  responsibilities: string[];
  tools: string[];
  metrics: {
    deploymentFrequency?: TeamMetric | string;
    leadTime?: TeamMetric | string;
    mttr?: TeamMetric | string;
    changeFailureRate?: TeamMetric | string;
  };
  slackChannel?: string;
  confluence?: string;
  oncallRotation?: {
    current: string;
    schedule: string;
  };
  health?: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues?: string[];
  };
}

export const TeamInfoWidget = () => {
  const classes = useStyles();
  const { config, currentTemplate } = useDashboardConfig();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const teamInfo = config?.spec?.team as TeamInfo;

  // Simulate team health calculation
  const calculateTeamHealth = (): TeamInfo['health'] => {
    if (!teamInfo?.metrics) return { status: 'healthy', score: 95 };

    let score = 100;
    const issues: string[] = [];

    // Check DORA metrics
    if (typeof teamInfo.metrics.changeFailureRate === 'object' &&
        teamInfo.metrics.changeFailureRate?.status === 'critical') {
      score -= 20;
      issues.push('High change failure rate');
    }

    if (typeof teamInfo.metrics.mttr === 'object' &&
        teamInfo.metrics.mttr?.status === 'warning') {
      score -= 10;
      issues.push('MTTR above target');
    }

    const status = score >= 90 ? 'healthy' : score >= 70 ? 'warning' : 'critical';
    return { status, score, issues };
  };

  const teamHealth = teamInfo?.health || calculateTeamHealth();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  if (!teamInfo) {
    return (
      <InfoCard title="Team Information" icon={<GroupIcon />}>
        <Box p={2} textAlign="center">
          <Typography color="textSecondary">
            No team information configured for this dashboard
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  const getHealthIcon = () => {
    switch (teamHealth.status) {
      case 'healthy':
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
      case 'warning':
        return <WarningIcon style={{ color: '#ff9800' }} />;
      case 'critical':
        return <ErrorIcon style={{ color: '#f44336' }} />;
      default:
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
    }
  };

  const getMetricData = (metric: TeamMetric | string | undefined) => {
    if (typeof metric === 'string') {
      return { value: metric, status: 'good' as const };
    }
    return metric || { value: 'N/A', status: 'good' as const };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#2196f3';
    }
  };

  return (
    <InfoCard
      title={teamInfo.displayName || teamInfo.name}
      icon={<GroupIcon />}
      action={
        <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={refreshing}
            className={classes.refreshButton}
          >
            <RefreshIcon style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      }
    >
      <Box>
        {/* Team Header with Health Status */}
        <Box className={classes.teamHeader}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>
                {teamInfo.displayName}
              </Typography>
              <Typography variant="body2">
                {teamInfo.description}
              </Typography>
            </Box>
            <Box className={classes.statusIndicator}>
              <Tooltip title={`Team Health: ${teamHealth.score}/100 - ${teamHealth.status}`}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getHealthIcon()}
                  <Typography variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                    {teamHealth.score}%
                  </Typography>
                  {teamHealth.issues && teamHealth.issues.length > 0 && (
                    <Badge badgeContent={teamHealth.issues.length} color="error">
                      <NotificationsActiveIcon fontSize="small" />
                    </Badge>
                  )}
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Health Status Details */}
        {teamHealth.issues && teamHealth.issues.length > 0 && (
          <Box className={classes.healthStatus}>
            <WarningIcon style={{ color: '#ff9800' }} />
            <Typography variant="body2" color="textSecondary">
              Issues: {teamHealth.issues.join(', ')}
            </Typography>
          </Box>
        )}

        {/* Enhanced Team Metrics */}
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            <TrendingUpIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
            DORA Metrics
          </Typography>
          <Grid container spacing={2}>
            {teamInfo.metrics.deploymentFrequency && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  {(() => {
                    const metric = getMetricData(teamInfo.metrics.deploymentFrequency);
                    return (
                      <>
                        <Typography className={classes.metricValue} style={{ color: getStatusColor(metric.status) }}>
                          {metric.value}
                        </Typography>
                        <Typography className={classes.metricLabel}>
                          Deployment Frequency
                        </Typography>
                        {metric.target && (
                          <Typography variant="caption" color="textSecondary">
                            Target: {metric.target}
                          </Typography>
                        )}
                        {metric.trend && (
                          <Typography
                            className={classes.metricTrend}
                            style={{
                              color: metric.trend === 'up' ? '#4caf50' :
                                     metric.trend === 'down' ? '#f44336' : '#666'
                            }}
                          >
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                          </Typography>
                        )}
                        {metric.percentage && (
                          <LinearProgress
                            variant="determinate"
                            value={metric.percentage}
                            className={classes.metricProgress}
                            color={metric.status === 'excellent' || metric.status === 'good' ? 'primary' : 'secondary'}
                          />
                        )}
                      </>
                    );
                  })()}
                </Card>
              </Grid>
            )}
            {teamInfo.metrics.leadTime && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  {(() => {
                    const metric = getMetricData(teamInfo.metrics.leadTime);
                    return (
                      <>
                        <Typography className={classes.metricValue} style={{ color: getStatusColor(metric.status) }}>
                          {metric.value}
                        </Typography>
                        <Typography className={classes.metricLabel}>
                          Lead Time
                        </Typography>
                        {metric.target && (
                          <Typography variant="caption" color="textSecondary">
                            Target: {metric.target}
                          </Typography>
                        )}
                        {metric.trend && (
                          <Typography
                            className={classes.metricTrend}
                            style={{
                              color: metric.trend === 'up' ? '#f44336' :
                                     metric.trend === 'down' ? '#4caf50' : '#666'
                            }}
                          >
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                          </Typography>
                        )}
                        {metric.percentage && (
                          <LinearProgress
                            variant="determinate"
                            value={metric.percentage}
                            className={classes.metricProgress}
                            color={metric.status === 'excellent' || metric.status === 'good' ? 'primary' : 'secondary'}
                          />
                        )}
                      </>
                    );
                  })()}
                </Card>
              </Grid>
            )}
            {teamInfo.metrics.mttr && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  {(() => {
                    const metric = getMetricData(teamInfo.metrics.mttr);
                    return (
                      <>
                        <Typography className={classes.metricValue} style={{ color: getStatusColor(metric.status) }}>
                          {metric.value}
                        </Typography>
                        <Typography className={classes.metricLabel}>
                          MTTR
                        </Typography>
                        {metric.target && (
                          <Typography variant="caption" color="textSecondary">
                            Target: {metric.target}
                          </Typography>
                        )}
                        {metric.trend && (
                          <Typography
                            className={classes.metricTrend}
                            style={{
                              color: metric.trend === 'up' ? '#f44336' :
                                     metric.trend === 'down' ? '#4caf50' : '#666'
                            }}
                          >
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                          </Typography>
                        )}
                        {metric.percentage && (
                          <LinearProgress
                            variant="determinate"
                            value={metric.percentage}
                            className={classes.metricProgress}
                            color={metric.status === 'excellent' || metric.status === 'good' ? 'primary' : 'secondary'}
                          />
                        )}
                      </>
                    );
                  })()}
                </Card>
              </Grid>
            )}
            {teamInfo.metrics.changeFailureRate && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  {(() => {
                    const metric = getMetricData(teamInfo.metrics.changeFailureRate);
                    return (
                      <>
                        <Typography className={classes.metricValue} style={{ color: getStatusColor(metric.status) }}>
                          {metric.value}
                        </Typography>
                        <Typography className={classes.metricLabel}>
                          Change Failure Rate
                        </Typography>
                        {metric.target && (
                          <Typography variant="caption" color="textSecondary">
                            Target: {metric.target}
                          </Typography>
                        )}
                        {metric.trend && (
                          <Typography
                            className={classes.metricTrend}
                            style={{
                              color: metric.trend === 'up' ? '#f44336' :
                                     metric.trend === 'down' ? '#4caf50' : '#666'
                            }}
                          >
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                          </Typography>
                        )}
                        {metric.percentage && (
                          <LinearProgress
                            variant="determinate"
                            value={metric.percentage}
                            className={classes.metricProgress}
                            color={metric.status === 'excellent' || metric.status === 'good' ? 'primary' : 'secondary'}
                          />
                        )}
                      </>
                    );
                  })()}
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Enhanced Team Members */}
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            <PersonIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Team Members ({teamInfo.members.length})
          </Typography>
          <List dense>
            {teamInfo.members.map((member, index) => {
              const isOnline = member.status === 'online';
              const isAway = member.status === 'away';
              const avatarClass = isOnline ? classes.onlineAvatar : classes.offlineAvatar;

              return (
                <ListItem key={index} className={classes.memberCard}>
                  <Badge
                    className={classes.statusBadge}
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    invisible={!isOnline}
                  >
                    <Avatar className={`${classes.avatar} ${avatarClass}`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </Badge>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
                        <Typography variant="body2">
                          <strong>{member.name}</strong>
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {member.status && (
                          <Chip
                            label={member.status}
                            size="small"
                            style={{
                              backgroundColor: isOnline ? '#e8f5e8' : isAway ? '#fff3e0' : '#f5f5f5',
                              color: isOnline ? '#2e7d32' : isAway ? '#ef6c00' : '#666',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                        {member.timezone && (
                          <Typography variant="caption" color="textSecondary">
                            {member.timezone}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="caption" display="block" gutterBottom>
                          📧 {member.email}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" style={{ gap: 4 }}>
                          {member.expertise.map((skill, skillIndex) => (
                            <Chip
                              key={skillIndex}
                              label={skill}
                              size="small"
                              variant="outlined"
                              className={classes.expertise}
                              style={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  {(member.name === teamInfo.lead || member.name.includes(teamInfo.lead)) && (
                    <Tooltip title="Team Lead">
                      <PersonIcon style={{ color: '#ff9800', marginLeft: 8 }} />
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider />

        {/* Tools & Technologies */}
        <Box mb={2} mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Tools & Technologies
          </Typography>
          <Box>
            {teamInfo.tools.map((tool, index) => (
              <Chip
                key={index}
                label={tool}
                className={classes.toolChip}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Quick Links */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Team Resources
          </Typography>
          <List dense>
            {teamInfo.slackChannel && (
              <ListItem>
                <ChatIcon style={{ marginRight: 8 }} />
                <ListItemText
                  primary="Slack Channel"
                  secondary={teamInfo.slackChannel}
                />
              </ListItem>
            )}
            {teamInfo.confluence && (
              <ListItem>
                <AssignmentIcon style={{ marginRight: 8 }} />
                <ListItemText
                  primary="Documentation"
                  secondary="Team Confluence Space"
                />
              </ListItem>
            )}
            {teamInfo.oncallRotation && (
              <ListItem>
                <PersonIcon style={{ marginRight: 8 }} />
                <ListItemText
                  primary={`On-Call: ${teamInfo.oncallRotation.current}`}
                  secondary={teamInfo.oncallRotation.schedule}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Box>
    </InfoCard>
  );
};