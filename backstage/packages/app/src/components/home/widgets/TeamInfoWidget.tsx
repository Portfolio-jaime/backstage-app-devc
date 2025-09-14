import React from 'react';
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
  CardContent
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import AssignmentIcon from '@material-ui/icons/Assignment';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import ChatIcon from '@material-ui/icons/Chat';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';

const useStyles = makeStyles(theme => ({
  teamHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    marginBottom: theme.spacing(2),
  },
  memberCard: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
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
  toolChip: {
    margin: theme.spacing(0.25),
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
}));

interface TeamMember {
  name: string;
  role: string;
  email: string;
  expertise: string[];
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
    deploymentFrequency?: string;
    leadTime?: string;
    mttr?: string;
    changeFailureRate?: string;
  };
  slackChannel?: string;
  confluence?: string;
  oncallRotation?: {
    current: string;
    schedule: string;
  };
}

export const TeamInfoWidget = () => {
  const classes = useStyles();
  const { config, currentTemplate } = useDashboardConfig();

  const teamInfo = config?.spec?.team as TeamInfo;

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

  return (
    <InfoCard
      title={teamInfo.displayName || teamInfo.name}
      icon={<GroupIcon />}
    >
      <Box>
        {/* Team Header */}
        <Box className={classes.teamHeader}>
          <Typography variant="h6" gutterBottom>
            {teamInfo.displayName}
          </Typography>
          <Typography variant="body2">
            {teamInfo.description}
          </Typography>
        </Box>

        {/* Team Metrics */}
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            <TrendingUpIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Team Metrics
          </Typography>
          <Grid container spacing={2}>
            {teamInfo.metrics.deploymentFrequency && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  <Typography className={classes.metricValue}>
                    {teamInfo.metrics.deploymentFrequency}
                  </Typography>
                  <Typography className={classes.metricLabel}>
                    Deployment Frequency
                  </Typography>
                </Card>
              </Grid>
            )}
            {teamInfo.metrics.leadTime && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  <Typography className={classes.metricValue}>
                    {teamInfo.metrics.leadTime}
                  </Typography>
                  <Typography className={classes.metricLabel}>
                    Lead Time
                  </Typography>
                </Card>
              </Grid>
            )}
            {teamInfo.metrics.mttr && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  <Typography className={classes.metricValue}>
                    {teamInfo.metrics.mttr}
                  </Typography>
                  <Typography className={classes.metricLabel}>
                    MTTR
                  </Typography>
                </Card>
              </Grid>
            )}
            {teamInfo.metrics.changeFailureRate && (
              <Grid item xs={6} md={3}>
                <Card className={classes.metricCard}>
                  <Typography className={classes.metricValue}>
                    {teamInfo.metrics.changeFailureRate}
                  </Typography>
                  <Typography className={classes.metricLabel}>
                    Change Failure Rate
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Team Members */}
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            <PersonIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Team Members ({teamInfo.members.length})
          </Typography>
          <List dense>
            {teamInfo.members.map((member, index) => (
              <ListItem key={index} className={classes.memberCard}>
                <Avatar className={classes.avatar}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        <strong>{member.name}</strong>
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {member.role}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="caption" display="block" gutterBottom>
                        {member.email}
                      </Typography>
                      <Box>
                        {member.expertise.map((skill, skillIndex) => (
                          <Chip
                            key={skillIndex}
                            label={skill}
                            size="small"
                            variant="outlined"
                            className={classes.expertise}
                          />
                        ))}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
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