import React from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { Grid, Typography, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FlightIcon from '@material-ui/icons/Flight';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles(theme => ({
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(1, 0),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
  },
  statusIcon: {
    marginRight: theme.spacing(1),
  },
  metric: {
    textAlign: 'center',
    padding: theme.spacing(1),
  },
}));

export const FlightOpsWidget = () => {
  const classes = useStyles();
  
  const flightMetrics = [
    { label: 'On Time Performance', value: '87%', status: 'good' },
    { label: 'Active Flights', value: '1,247', status: 'good' },
    { label: 'Delayed Flights', value: '23', status: 'warning' },
    { label: 'Cancelled', value: '2', status: 'error' },
  ];

  const systemStatus = [
    { name: 'Flight Management System', status: 'operational', icon: <CheckCircleIcon style={{ color: '#4caf50' }} /> },
    { name: 'Baggage Handling', status: 'operational', icon: <CheckCircleIcon style={{ color: '#4caf50' }} /> },
    { name: 'Check-in Systems', status: 'degraded', icon: <WarningIcon style={{ color: '#ff9800' }} /> },
    { name: 'Gate Management', status: 'operational', icon: <CheckCircleIcon style={{ color: '#4caf50' }} /> },
  ];

  return (
    <InfoCard title="Flight Operations Status" icon={<FlightIcon />}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Today's Metrics
          </Typography>
          {flightMetrics.map((metric, index) => (
            <div key={index} className={classes.metric}>
              <Typography variant="h4" color="primary">
                {metric.value}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {metric.label}
              </Typography>
            </div>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          {systemStatus.map((system, index) => (
            <div key={index} className={classes.statusItem}>
              <div className={classes.statusIcon}>
                {system.icon}
              </div>
              <div style={{ flexGrow: 1 }}>
                <Typography variant="body2">
                  {system.name}
                </Typography>
                <Chip 
                  label={system.status.toUpperCase()} 
                  size="small" 
                  color={system.status === 'operational' ? 'primary' : 'secondary'}
                />
              </div>
            </div>
          ))}
        </Grid>
      </Grid>
    </InfoCard>
  );
};