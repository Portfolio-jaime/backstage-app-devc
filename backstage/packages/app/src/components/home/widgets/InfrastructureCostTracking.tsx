import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  Avatar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  AttachMoney as CostIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Computer as ComputeIcon,
  NetworkCheck as NetworkIcon,
} from '@material-ui/icons';
import { InfoCard } from '@backstage/core-components';

const useStyles = makeStyles((theme) => ({
  costCard: {
    marginBottom: theme.spacing(1),
    border: '1px solid var(--theme-border, ' + theme.palette.divider + ')',
    backgroundColor: 'var(--theme-surface, ' + theme.palette.background.paper + ')',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[3],
    },
  },
  budgetProgress: {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1),
  },
  costAmount: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  trendIcon: {
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
  },
  trendUp: {
    color: 'var(--theme-error, #f44336)',
  },
  trendDown: {
    color: 'var(--theme-success, #4caf50)',
  },
  warningBudget: {
    color: 'var(--theme-warning, #ff9800)',
  },
  criticalBudget: {
    color: 'var(--theme-error, #f44336)',
  },
  healthyBudget: {
    color: 'var(--theme-success, #4caf50)',
  },
  serviceIcon: {
    width: 24,
    height: 24,
    fontSize: '1rem',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  timeStamp: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
  summaryCard: {
    backgroundColor: 'var(--theme-primary, #2196f3)15',
    border: '1px solid var(--theme-primary, #2196f3)30',
  },
}));

interface CostData {
  service: string;
  environment: string;
  provider: 'aws' | 'azure' | 'gcp';
  category: 'compute' | 'storage' | 'network' | 'database' | 'other';
  currentCost: number;
  budgetLimit: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  lastMonth: number;
  forecast: number;
}

// Mock data - en producción esto vendría de APIs de AWS/Azure/GCP
const mockCostData: CostData[] = [
  {
    service: 'EKS Cluster (PROD)',
    environment: 'PROD',
    provider: 'aws',
    category: 'compute',
    currentCost: 2847.32,
    budgetLimit: 3000,
    trend: 'up',
    trendPercentage: 12.5,
    lastMonth: 2530.15,
    forecast: 3100.45,
  },
  {
    service: 'RDS Instances',
    environment: 'PROD',
    provider: 'aws',
    category: 'database',
    currentCost: 1456.78,
    budgetLimit: 1800,
    trend: 'stable',
    trendPercentage: 2.1,
    lastMonth: 1425.33,
    forecast: 1480.20,
  },
  {
    service: 'S3 Storage',
    environment: 'ALL',
    provider: 'aws',
    category: 'storage',
    currentCost: 387.45,
    budgetLimit: 500,
    trend: 'up',
    trendPercentage: 8.3,
    lastMonth: 357.82,
    forecast: 420.15,
  },
  {
    service: 'Azure AKS (STG)',
    environment: 'STG',
    provider: 'azure',
    category: 'compute',
    currentCost: 945.12,
    budgetLimit: 1000,
    trend: 'down',
    trendPercentage: -5.2,
    lastMonth: 996.45,
    forecast: 890.30,
  },
  {
    service: 'CloudWatch & Monitoring',
    environment: 'ALL',
    provider: 'aws',
    category: 'other',
    currentCost: 234.56,
    budgetLimit: 300,
    trend: 'stable',
    trendPercentage: 1.8,
    lastMonth: 230.42,
    forecast: 240.10,
  },
];

export const InfrastructureCostTracking: React.FC = () => {
  const classes = useStyles();
  const [costData, setCostData] = useState<CostData[]>(mockCostData);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Calcular totales
  const totalCurrentCost = costData.reduce((sum, item) => sum + item.currentCost, 0);
  const totalBudget = costData.reduce((sum, item) => sum + item.budgetLimit, 0);
  const totalForecast = costData.reduce((sum, item) => sum + item.forecast, 0);
  const budgetUsagePercentage = (totalCurrentCost / totalBudget) * 100;

  // Simular actualizaciones de costos
  useEffect(() => {
    const interval = setInterval(() => {
      setCostData(current =>
        current.map(item => ({
          ...item,
          currentCost: item.currentCost + (Math.random() - 0.5) * 10, // Pequeña fluctuación
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular llamada a API de AWS/Azure cost management
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compute':
        return <ComputeIcon />;
      case 'storage':
        return <StorageIcon />;
      case 'network':
        return <NetworkIcon />;
      case 'database':
        return <StorageIcon />;
      default:
        return <CloudIcon />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws':
        return '#FF9900';
      case 'azure':
        return '#0078D4';
      case 'gcp':
        return '#4285F4';
      default:
        return '#666666';
    }
  };

  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 90) return classes.criticalBudget;
    if (percentage >= 75) return classes.warningBudget;
    return classes.healthyBudget;
  };

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') {
      return <TrendingUpIcon className={`${classes.trendIcon} ${classes.trendUp}`} />;
    }
    if (trend === 'down') {
      return <TrendingDownIcon className={`${classes.trendIcon} ${classes.trendDown}`} />;
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <InfoCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CostIcon />
            <span>Infrastructure Cost Tracking</span>
            <Chip
              label={`${budgetUsagePercentage.toFixed(1)}% of budget`}
              size="small"
              style={{
                backgroundColor: budgetUsagePercentage >= 90 ? '#ffebee' :
                                budgetUsagePercentage >= 75 ? '#fff3e0' : '#e8f5e8',
                color: budgetUsagePercentage >= 90 ? '#d32f2f' :
                       budgetUsagePercentage >= 75 ? '#f57c00' : '#388e3c',
              }}
            />
          </Box>
          <Box className={classes.headerActions}>
            <Typography variant="caption" className={classes.timeStamp}>
              Last update: {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Tooltip title="Refresh cost data">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
    >
      <Box p={1}>
        {/* Summary Card */}
        <Card className={`${classes.costCard} ${classes.summaryCard}`}>
          <CardContent style={{ padding: '16px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Current Month
                </Typography>
                <Typography variant="h5" className={classes.costAmount}>
                  {formatCurrency(totalCurrentCost)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Total Budget
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(totalBudget)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Forecast
                </Typography>
                <Typography variant="h6" className={totalForecast > totalBudget ? classes.criticalBudget : ''}>
                  {formatCurrency(totalForecast)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Budget Usage
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(budgetUsagePercentage, 100)}
                  className={classes.budgetProgress}
                  color={budgetUsagePercentage >= 90 ? 'secondary' : 'primary'}
                />
                <Typography variant="body2" className={getBudgetStatusColor(budgetUsagePercentage)}>
                  {budgetUsagePercentage.toFixed(1)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Individual Services */}
        {costData.map((item, index) => (
          <Card key={index} className={classes.costCard}>
            <CardContent style={{ padding: '12px 16px' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Avatar
                      className={classes.serviceIcon}
                      style={{ backgroundColor: getProviderColor(item.provider) }}
                    >
                      {getCategoryIcon(item.category)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {item.service}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.provider.toUpperCase()} • {item.environment}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="textSecondary">
                    Current
                  </Typography>
                  <Typography variant="body1" className={classes.costAmount}>
                    {formatCurrency(item.currentCost)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="textSecondary">
                    Budget
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(item.budgetLimit)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((item.currentCost / item.budgetLimit) * 100, 100)}
                    size="small"
                    style={{ marginTop: 2 }}
                    color={(item.currentCost / item.budgetLimit) >= 0.9 ? 'secondary' : 'primary'}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2">
                      {item.trend !== 'stable' && (
                        <>
                          {getTrendIcon(item.trend, item.trendPercentage)}
                          <span style={{ marginLeft: 4 }}>
                            {Math.abs(item.trendPercentage).toFixed(1)}%
                          </span>
                        </>
                      )}
                      {item.trend === 'stable' && (
                        <span style={{ color: '#666' }}>Stable</span>
                      )}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    vs last month
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Box mt={2} display="flex" gap={1} justifyContent="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<LaunchIcon />}
            onClick={() => window.open('https://console.aws.amazon.com/cost-management/home', '_blank')}
          >
            AWS Cost Explorer
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LaunchIcon />}
            onClick={() => window.open('https://portal.azure.com/#blade/Microsoft_Azure_CostManagement', '_blank')}
          >
            Azure Cost Management
          </Button>
        </Box>

        {totalForecast > totalBudget && (
          <Box mt={2} p={2} style={{
            backgroundColor: '#ffebee',
            borderRadius: 4,
            border: '1px solid #f44336',
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningIcon style={{ color: '#f44336' }} />
              <Typography variant="body2" style={{ color: '#f44336', fontWeight: 600 }}>
                Budget Alert: Forecast exceeds budget by {formatCurrency(totalForecast - totalBudget)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};