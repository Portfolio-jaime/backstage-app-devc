import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  Notifications as NotificationIcon,
  Phone as OnCallIcon,
  Assignment as IncidentIcon,
  Security as SecurityIcon,
  Storage as InfraIcon,
  Code as AppIcon,
} from '@material-ui/icons';
import { InfoCard } from '@backstage/core-components';

const useStyles = makeStyles((theme) => ({
  alertCard: {
    marginBottom: theme.spacing(1),
    border: '1px solid var(--theme-border, ' + theme.palette.divider + ')',
    backgroundColor: 'var(--theme-surface, ' + theme.palette.background.paper + ')',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[3],
    },
  },
  criticalAlert: {
    borderLeft: '4px solid #f44336',
    backgroundColor: '#ffebee',
  },
  warningAlert: {
    borderLeft: '4px solid #ff9800',
    backgroundColor: '#fff3e0',
  },
  infoAlert: {
    borderLeft: '4px solid #2196f3',
    backgroundColor: '#e3f2fd',
  },
  resolvedAlert: {
    borderLeft: '4px solid #4caf50',
    backgroundColor: '#e8f5e8',
    opacity: 0.8,
  },
  severityChip: {
    fontWeight: 'bold',
    fontSize: '0.7rem',
  },
  criticalChip: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  warningChip: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  infoChip: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  resolvedChip: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  onCallBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    fontWeight: 'bold',
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
  summaryStats: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  statCard: {
    padding: theme.spacing(1),
    textAlign: 'center',
    minWidth: 80,
    backgroundColor: 'var(--theme-surface, ' + theme.palette.background.paper + ')',
    border: '1px solid var(--theme-border, ' + theme.palette.divider + ')',
    borderRadius: theme.shape.borderRadius,
  },
}));

interface AlertData {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
  category: 'infrastructure' | 'application' | 'security' | 'performance';
  source: string;
  environment: string;
  assignee?: string;
  createdAt: string;
  resolvedAt?: string;
  url?: string;
  tags: string[];
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
}

interface OnCallData {
  current: string;
  backup: string;
  schedule: string;
  escalation: string[];
}

// Mock data - en producción esto vendría de PagerDuty, ServiceNow, etc.
const mockAlerts: AlertData[] = [
  {
    id: '1',
    title: 'High CPU Usage - PROD EKS Cluster',
    description: 'CPU utilization has exceeded 85% threshold for the past 15 minutes',
    severity: 'critical',
    category: 'infrastructure',
    source: 'CloudWatch',
    environment: 'PROD',
    assignee: 'jaime.henao',
    createdAt: '5 minutes ago',
    url: 'https://console.aws.amazon.com/cloudwatch/home#alarmsV2',
    tags: ['kubernetes', 'cpu', 'performance'],
    status: 'investigating',
  },
  {
    id: '2',
    title: 'Database Connection Pool Exhausted',
    description: 'RDS connection pool is at maximum capacity, new connections failing',
    severity: 'critical',
    category: 'application',
    source: 'Application Logs',
    environment: 'PROD',
    assignee: 'devops1',
    createdAt: '12 minutes ago',
    url: 'https://github.com/Portfolio-jaime/app/issues/123',
    tags: ['database', 'rds', 'connections'],
    status: 'acknowledged',
  },
  {
    id: '3',
    title: 'SSL Certificate Expiring Soon',
    description: 'SSL certificate for *.ba.com will expire in 7 days',
    severity: 'warning',
    category: 'security',
    source: 'Certificate Monitor',
    environment: 'ALL',
    createdAt: '2 hours ago',
    url: 'https://ssl-checker.ba.com',
    tags: ['ssl', 'certificate', 'security'],
    status: 'open',
  },
  {
    id: '4',
    title: 'Deployment Failed - Staging',
    description: 'GitHub Actions deployment to staging environment failed',
    severity: 'warning',
    category: 'application',
    source: 'GitHub Actions',
    environment: 'STG',
    assignee: 'devops2',
    createdAt: '45 minutes ago',
    resolvedAt: '30 minutes ago',
    url: 'https://github.com/Portfolio-jaime/app/actions/runs/123',
    tags: ['deployment', 'github-actions', 'staging'],
    status: 'resolved',
  },
  {
    id: '5',
    title: 'Unusual API Response Times',
    description: 'API response times have increased by 40% over the last hour',
    severity: 'info',
    category: 'performance',
    source: 'APM',
    environment: 'PROD',
    createdAt: '1 hour ago',
    url: 'https://apm.ba.com/dashboard',
    tags: ['api', 'performance', 'monitoring'],
    status: 'open',
  },
];

const mockOnCall: OnCallData = {
  current: 'jaime.henao',
  backup: 'devops1',
  schedule: 'Weekly rotation - Monday to Sunday',
  escalation: ['jaime.henao', 'devops1', 'devops2', 'team-lead'],
};

export const AlertingIncidentManagement: React.FC = () => {
  const classes = useStyles();
  const [alerts, setAlerts] = useState<AlertData[]>(mockAlerts);
  const [onCall, setOnCall] = useState<OnCallData>(mockOnCall);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  // Calcular estadísticas
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    warning: alerts.filter(a => a.severity === 'warning' && a.status !== 'resolved').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  // Simular actualizaciones de alertas
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular resolución de alertas
      setAlerts(current =>
        current.map(alert => {
          if (alert.status !== 'resolved' && Math.random() > 0.95) {
            return {
              ...alert,
              status: 'resolved',
              resolvedAt: 'just now',
              severity: 'resolved',
            };
          }
          return alert;
        })
      );
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular llamada a API de PagerDuty/ServiceNow
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      case 'resolved':
        return <ResolvedIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return `${classes.severityChip} ${classes.criticalChip}`;
      case 'warning':
        return `${classes.severityChip} ${classes.warningChip}`;
      case 'info':
        return `${classes.severityChip} ${classes.infoChip}`;
      case 'resolved':
        return `${classes.severityChip} ${classes.resolvedChip}`;
      default:
        return classes.severityChip;
    }
  };

  const getAlertCardClass = (severity: string) => {
    const baseClass = classes.alertCard;
    switch (severity) {
      case 'critical':
        return `${baseClass} ${classes.criticalAlert}`;
      case 'warning':
        return `${baseClass} ${classes.warningAlert}`;
      case 'info':
        return `${baseClass} ${classes.infoAlert}`;
      case 'resolved':
        return `${baseClass} ${classes.resolvedAlert}`;
      default:
        return baseClass;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return <InfraIcon />;
      case 'application':
        return <AppIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'performance':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const openAlertDetails = (alert: AlertData) => {
    setSelectedAlert(alert);
    setDetailsOpen(true);
  };

  return (
    <InfoCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationIcon />
            <span>Alerts & Incident Management</span>
            <Badge badgeContent={stats.critical + stats.warning} color="error">
              <IncidentIcon />
            </Badge>
          </Box>
          <Box className={classes.headerActions}>
            <Chip
              icon={<OnCallIcon />}
              label={`On-call: ${onCall.current}`}
              size="small"
              className={classes.onCallBadge}
            />
            <Typography variant="caption" className={classes.timeStamp}>
              Last update: {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Tooltip title="Refresh alerts">
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
        {/* Summary Statistics */}
        <Box className={classes.summaryStats}>
          <Box className={classes.statCard}>
            <Typography variant="h6" style={{ color: '#f44336' }}>
              {stats.critical}
            </Typography>
            <Typography variant="caption">Critical</Typography>
          </Box>
          <Box className={classes.statCard}>
            <Typography variant="h6" style={{ color: '#ff9800' }}>
              {stats.warning}
            </Typography>
            <Typography variant="caption">Warning</Typography>
          </Box>
          <Box className={classes.statCard}>
            <Typography variant="h6" style={{ color: '#2196f3' }}>
              {stats.total - stats.resolved}
            </Typography>
            <Typography variant="caption">Active</Typography>
          </Box>
          <Box className={classes.statCard}>
            <Typography variant="h6" style={{ color: '#4caf50' }}>
              {stats.resolved}
            </Typography>
            <Typography variant="caption">Resolved</Typography>
          </Box>
        </Box>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
            No active alerts
          </Typography>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <Card key={alert.id} className={getAlertCardClass(alert.severity)}>
              <CardContent style={{ padding: '12px 16px' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Avatar style={{ width: 24, height: 24 }}>
                        {getCategoryIcon(alert.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: 600 }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {alert.source} • {alert.environment}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" style={{ fontSize: '0.8rem' }}>
                      {alert.description}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Chip
                        icon={getSeverityIcon(alert.severity)}
                        label={alert.severity.toUpperCase()}
                        className={getSeverityClass(alert.severity)}
                      />
                    </Box>
                    <Typography variant="caption" className={classes.timeStamp}>
                      {alert.resolvedAt ? `Resolved ${alert.resolvedAt}` : `Created ${alert.createdAt}`}
                    </Typography>
                    {alert.assignee && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <PersonIcon style={{ fontSize: '0.8rem' }} />
                        <Typography variant="caption">
                          {alert.assignee}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openAlertDetails(alert)}
                      >
                        Details
                      </Button>
                      {alert.url && (
                        <Tooltip title="Open in source">
                          <IconButton
                            size="small"
                            onClick={() => window.open(alert.url, '_blank')}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}

        {/* Action Buttons */}
        <Box mt={2} display="flex" gap={1} justifyContent="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<LaunchIcon />}
            onClick={() => window.open('https://pagerduty.com', '_blank')}
          >
            PagerDuty
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LaunchIcon />}
            onClick={() => window.open('/catalog?filters=tag:monitoring', '_blank')}
          >
            Monitoring Services
          </Button>
        </Box>
      </Box>

      {/* Alert Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedAlert && getSeverityIcon(selectedAlert.severity)}
            <span>Alert Details</span>
            {selectedAlert && (
              <Chip
                label={selectedAlert.severity.toUpperCase()}
                className={getSeverityClass(selectedAlert.severity)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAlert.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedAlert.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Source</Typography>
                  <Typography variant="body2">{selectedAlert.source}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Environment</Typography>
                  <Typography variant="body2">{selectedAlert.environment}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body2">{selectedAlert.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Assignee</Typography>
                  <Typography variant="body2">{selectedAlert.assignee || 'Unassigned'}</Typography>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="subtitle2">Tags</Typography>
                <Box mt={1}>
                  {selectedAlert.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" style={{ margin: '2px' }} />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedAlert?.url && (
            <Button
              color="primary"
              startIcon={<LaunchIcon />}
              onClick={() => window.open(selectedAlert.url, '_blank')}
            >
              Open Source
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </InfoCard>
  );
};