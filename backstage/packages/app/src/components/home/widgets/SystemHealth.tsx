import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { Grid, Typography, Box, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const useStyles = makeStyles(theme => ({
  metricBox: {
    textAlign: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(1),
  },
  healthScore: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  chartContainer: {
    height: 200,
    marginTop: theme.spacing(2),
  },
}));

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];

export const SystemHealth = () => {
  const classes = useStyles();

  // Show simple message instead of simulated data
  return (
    <InfoCard title="System Health Overview" icon={<AssessmentIcon />}>
      <Box p={3} textAlign="center">
        <Typography variant="h6" gutterBottom>
          🔧 System Monitoring
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Real-time system health monitoring is being configured.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Connect your monitoring tools to display actual system metrics here.
        </Typography>
      </Box>
    </InfoCard>
  );

  // Original simulated data code below (commented out)
  /*
  
  const healthData = [
    { name: 'Healthy', value: 78, color: '#4caf50' },
    { name: 'Warning', value: 15, color: '#ff9800' },
    { name: 'Critical', value: 5, color: '#f44336' },
    { name: 'Unknown', value: 2, color: '#9e9e9e' },
  ];

  const performanceData = [
    { name: 'API Gateway', response: 45, uptime: 99.9 },
    { name: 'Booking Service', response: 120, uptime: 99.5 },
    { name: 'Customer DB', response: 85, uptime: 99.8 },
    { name: 'Flight Info', response: 65, uptime: 99.7 },
    { name: 'Mobile App', response: 200, uptime: 98.9 },
  ];

  const overallHealth = 94;

  return (
    <InfoCard title="System Health Overview" icon={<AssessmentIcon />}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <div className={classes.metricBox}>
            <Typography variant="h6" gutterBottom>
              Overall Health Score
            </Typography>
            <Typography className={classes.healthScore}>
              {overallHealth}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={overallHealth} 
              style={{ marginTop: 8 }}
              color={overallHealth > 90 ? 'primary' : 'secondary'}
            />
          </div>
          
          <div className={classes.metricBox}>
            <Typography variant="h6" gutterBottom>
              Service Status
            </Typography>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Response Times (ms)
          </Typography>
          <div className={classes.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Service Uptime
            </Typography>
            {performanceData.map((service, index) => (
              <Box key={index} mb={1}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{service.name}</Typography>
                  <Typography variant="body2" color="primary">{service.uptime}%</Typography>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={service.uptime} 
                  style={{ marginTop: 4 }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </InfoCard>
  );
  */
};