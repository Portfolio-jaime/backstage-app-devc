import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[6],
    },
  },
  cardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  icon: {
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
    lineHeight: 1.4,
    marginBottom: theme.spacing(2),
    flexGrow: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
}));

interface DashboardCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

interface DashboardCardsProps {
  dashboards: DashboardCard[];
  onDashboardSelect: (dashboardId: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors = {
    'Operations': 'primary',
    'Engineering': 'secondary',
    'Security': 'default',
    'Management': 'primary',
    'Development': 'secondary',
    'Environments': 'primary',
    'Documentation': 'secondary',
    'Overview': 'default',
  };
  return colors[category as keyof typeof colors] || 'default';
};

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  dashboards,
  onDashboardSelect,
}) => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      {dashboards.map((dashboard) => (
        <Grid item xs={12} sm={6} md={4} key={dashboard.id}>
          <Card className={classes.card} elevation={2}>
            <CardActionArea 
              className={classes.cardContent}
              onClick={() => onDashboardSelect(dashboard.id)}
            >
              <CardContent style={{ padding: 0 }}>
                <Box className={classes.icon}>
                  {dashboard.icon}
                </Box>
                
                <Typography variant="h6" className={classes.title}>
                  {dashboard.name}
                </Typography>
                
                <Typography variant="body2" className={classes.description}>
                  {dashboard.description}
                </Typography>
                
                <Chip
                  label={dashboard.category}
                  size="small"
                  color={getCategoryColor(dashboard.category) as any}
                  variant="outlined"
                  className={classes.categoryChip}
                />
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};