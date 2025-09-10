import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { Grid, Typography, LinearProgress, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';

const useStyles = makeStyles(theme => ({
  costItem: {
    padding: theme.spacing(2),
    margin: theme.spacing(1, 0),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendIcon: {
    marginLeft: theme.spacing(1),
  },
}));

export const CostDashboard = () => {
  const classes = useStyles();
  
  const costData = [
    { 
      service: 'AWS EC2', 
      current: '$45,230', 
      budget: '$50,000', 
      percentage: 90, 
      trend: 'up',
      change: '+5.2%'
    },
    { 
      service: 'AWS S3', 
      current: '$12,450', 
      budget: '$15,000', 
      percentage: 83, 
      trend: 'down',
      change: '-2.1%'
    },
    { 
      service: 'Azure VMs', 
      current: '$28,900', 
      budget: '$35,000', 
      percentage: 83, 
      trend: 'up',
      change: '+3.4%'
    },
    { 
      service: 'GCP Compute', 
      current: '$8,750', 
      budget: '$12,000', 
      percentage: 73, 
      trend: 'down',
      change: '-1.8%'
    },
  ];

  const totalCost = costData.reduce((sum, item) => sum + parseInt(item.current.replace('$', '').replace(',', '')), 0);
  const totalBudget = costData.reduce((sum, item) => sum + parseInt(item.budget.replace('$', '').replace(',', '')), 0);
  const overallPercentage = Math.round((totalCost / totalBudget) * 100);

  return (
    <InfoCard title="Cloud Cost Management" icon={<AttachMoneyIcon />}>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Monthly Overview
        </Typography>
        <Typography variant="h4" color="primary">
          ${totalCost.toLocaleString()} / ${totalBudget.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {overallPercentage}% of monthly budget used
        </Typography>
        <Box mt={1}>
          <LinearProgress 
            variant="determinate" 
            value={overallPercentage} 
            color={overallPercentage > 90 ? 'secondary' : 'primary'}
          />
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Service Breakdown
      </Typography>
      
      {costData.map((item, index) => (
        <div key={index} className={classes.costItem}>
          <div className={classes.trend}>
            <div>
              <Typography variant="subtitle2">
                {item.service}
              </Typography>
              <Typography variant="h6">
                {item.current} / {item.budget}
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {item.change}
              </Typography>
              {item.trend === 'up' ? (
                <TrendingUpIcon className={classes.trendIcon} style={{ color: '#f44336' }} />
              ) : (
                <TrendingDownIcon className={classes.trendIcon} style={{ color: '#4caf50' }} />
              )}
            </div>
          </div>
          <Box mt={1}>
            <LinearProgress 
              variant="determinate" 
              value={item.percentage} 
              color={item.percentage > 90 ? 'secondary' : 'primary'}
            />
          </Box>
          <Typography variant="caption" color="textSecondary">
            {item.percentage}% of budget
          </Typography>
        </div>
      ))}
    </InfoCard>
  );
};