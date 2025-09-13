import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { List, ListItem, ListItemText, Typography, Chip, Box } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import SecurityIcon from '@material-ui/icons/Security';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles(theme => ({
  alertItem: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5, 0),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    borderColor: theme.palette.divider,
  },
  criticalAlert: {
    borderColor: '#f44336',
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(244, 67, 54, 0.15)' : '#ffebee',
  },
  warningAlert: {
    borderColor: '#ff9800',
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0',
  },
  infoAlert: {
    borderColor: '#2196f3',
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(33, 150, 243, 0.15)' : '#e3f2fd',
  },
  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  severityChip: {
    fontWeight: 'bold',
  },
}));

export const SecurityAlerts = () => {
  const classes = useStyles();
  const theme = useTheme();
  
  const alerts = [
    {
      id: 'SEC-001',
      title: 'Suspicious Login Attempts',
      description: 'Multiple failed login attempts detected from IP 192.168.1.100',
      severity: 'critical',
      timestamp: '15 minutes ago',
      service: 'Auth Service',
    },
    {
      id: 'SEC-002', 
      title: 'SSL Certificate Expiring',
      description: 'Certificate for api.britishairways.com expires in 7 days',
      severity: 'warning',
      timestamp: '2 hours ago',
      service: 'API Gateway',
    },
    {
      id: 'SEC-003',
      title: 'Vulnerability Scan Complete',
      description: '2 medium vulnerabilities found in customer-portal dependencies',
      severity: 'warning',
      timestamp: '4 hours ago',
      service: 'Customer Portal',
    },
    {
      id: 'SEC-004',
      title: 'Security Patch Applied',
      description: 'Successfully updated flight-booking-api with latest security patches',
      severity: 'info',
      timestamp: '6 hours ago',
      service: 'Booking API',
    },
  ];

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return classes.criticalAlert;
      case 'warning':
        return classes.warningAlert;
      default:
        return classes.infoAlert;
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconColor = theme.palette.type === 'dark' ? 0.9 : 1;
    switch (severity) {
      case 'critical':
        return <ErrorIcon style={{ color: `rgba(244, 67, 54, ${iconColor})`, fontSize: 20 }} />;
      case 'warning':
        return <WarningIcon style={{ color: `rgba(255, 152, 0, ${iconColor})`, fontSize: 20 }} />;
      default:
        return <InfoIcon style={{ color: `rgba(33, 150, 243, ${iconColor})`, fontSize: 20 }} />;
    }
  };

  const getSeverityColor = (severity: string): "default" | "primary" | "secondary" => {
    switch (severity) {
      case 'critical':
        return 'secondary';
      case 'warning':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <InfoCard title="Security Alerts" icon={<SecurityIcon />}>
      <Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Real-time security monitoring across BA infrastructure
        </Typography>
        
        {alerts.map((alert, index) => (
          <div key={index} className={`${classes.alertItem} ${getSeverityClass(alert.severity)}`}>
            <div className={classes.alertHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getSeverityIcon(alert.severity)}
                <Typography variant="subtitle2" style={{ marginLeft: 8 }}>
                  {alert.title}
                </Typography>
              </div>
              <Chip 
                label={alert.severity.toUpperCase()} 
                size="small"
                color={getSeverityColor(alert.severity)}
                className={classes.severityChip}
              />
            </div>
            
            <Typography variant="body2" gutterBottom>
              {alert.description}
            </Typography>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                {alert.service} • {alert.id}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {alert.timestamp}
              </Typography>
            </div>
          </div>
        ))}
      </Box>
    </InfoCard>
  );
};