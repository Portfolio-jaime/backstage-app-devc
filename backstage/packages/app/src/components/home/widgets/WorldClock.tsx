import React, { useState, useEffect } from 'react';
import { InfoCard } from '@backstage/core-components';
import { Grid, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

const useStyles = makeStyles(theme => ({
  clockItem: {
    textAlign: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(1),
  },
  time: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    fontFamily: 'monospace',
  },
  location: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

export const WorldClock = () => {
  const classes = useStyles();
  const [times, setTimes] = useState<{[key: string]: string}>({});
  
  const timezones = [
    { location: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
    { location: 'New York', timezone: 'America/New_York', flag: '🇺🇸' },
    { location: 'Dubai', timezone: 'Asia/Dubai', flag: '🇦🇪' },
    { location: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
    { location: 'Sydney', timezone: 'Australia/Sydney', flag: '🇦🇺' },
    { location: 'Mumbai', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  ];

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: {[key: string]: string} = {};
      timezones.forEach(tz => {
        const time = new Date().toLocaleTimeString('en-GB', {
          timeZone: tz.timezone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        newTimes[tz.location] = time;
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getTimeOfDay = (location: string, timezone: string) => {
    const hour = new Date().toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    });
    const hourNum = parseInt(hour);
    
    if (hourNum >= 6 && hourNum < 12) return '🌅';
    if (hourNum >= 12 && hourNum < 18) return '☀️';
    if (hourNum >= 18 && hourNum < 22) return '🌆';
    return '🌙';
  };

  return (
    <InfoCard title="BA Global Operations Time" icon={<AccessTimeIcon />}>
      <Grid container spacing={1}>
        {timezones.map((tz, index) => (
          <Grid item xs={6} md={4} key={index}>
            <div className={classes.clockItem}>
              <div style={{ fontSize: '1.5rem' }}>
                {tz.flag} {getTimeOfDay(tz.location, tz.timezone)}
              </div>
              <Typography className={classes.time}>
                {times[tz.location] || '00:00:00'}
              </Typography>
              <Typography className={classes.location}>
                {tz.location}
              </Typography>
            </div>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="textSecondary">
          Real-time clocks for BA operations worldwide
        </Typography>
      </Box>
    </InfoCard>
  );
};