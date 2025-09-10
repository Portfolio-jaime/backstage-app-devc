import React, { useState, useEffect } from 'react';
import { InfoCard } from '@backstage/core-components';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Chip, 
  CircularProgress, 
  Box,
  LinearProgress,
  Divider
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import StorageIcon from '@material-ui/icons/Storage';
import HttpIcon from '@material-ui/icons/Http';
import LanguageIcon from '@material-ui/icons/Language';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

const useStyles = makeStyles(theme => ({
  serviceItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    fontSize: '0.875rem',
  },
  healthIndicator: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  statsBox: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
}));

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
}

export const LiveCatalogServices = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    components: 0,
    apis: 0,
    resources: 0,
  });

  // Simulated health data - en producción esto vendría de tu monitoring
  const getServiceHealth = (entityName: string): ServiceHealth => {
    const healthData: { [key: string]: ServiceHealth } = {
      'gitops': { name: 'gitops', status: 'healthy', uptime: 99.9, responseTime: 45 },
      'go-cli': { name: 'go-cli', status: 'healthy', uptime: 99.7, responseTime: 120 },
      'python-app-1': { name: 'python-app-1', status: 'warning', uptime: 98.5, responseTime: 200 },
      'test-1': { name: 'test-1', status: 'healthy', uptime: 99.8, responseTime: 85 },
      'argocd-solutions': { name: 'argocd-solutions', status: 'healthy', uptime: 99.6, responseTime: 65 },
      'test1': { name: 'test1', status: 'warning', uptime: 97.2, responseTime: 180 },
    };
    
    return healthData[entityName] || { 
      name: entityName, 
      status: 'healthy', 
      uptime: 99.0 + Math.random() * 0.9, 
      responseTime: 50 + Math.random() * 100 
    };
  };

  const getEntityIcon = (entity: Entity) => {
    const kind = entity.kind.toLowerCase();
    const type = entity.spec?.type?.toString().toLowerCase() || '';
    
    if (kind === 'api') return <HttpIcon style={{ color: '#2196f3' }} />;
    if (kind === 'resource') return <CloudQueueIcon style={{ color: '#ff9800' }} />;
    if (type.includes('service')) return <StorageIcon style={{ color: '#4caf50' }} />;
    if (type.includes('website')) return <LanguageIcon style={{ color: '#9c27b0' }} />;
    
    return <StorageIcon style={{ color: '#666' }} />;
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon style={{ color: '#4caf50', fontSize: 16 }} />;
      case 'warning':
        return <WarningIcon style={{ color: '#ff9800', fontSize: 16 }} />;
      default:
        return <WarningIcon style={{ color: '#f44336', fontSize: 16 }} />;
    }
  };

  const getHealthColor = (status: string): "default" | "primary" | "secondary" => {
    switch (status) {
      case 'healthy':
        return 'primary';
      case 'warning':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all entities from Backstage catalog
        const response = await catalogApi.getEntities({
          filter: {
            kind: ['Component', 'API', 'Resource'],
          },
        });

        const catalogEntities = response.items;
        setEntities(catalogEntities.slice(0, 8)); // Mostrar máximo 8

        // Calculate stats
        const newStats = {
          total: catalogEntities.length,
          components: catalogEntities.filter(e => e.kind === 'Component').length,
          apis: catalogEntities.filter(e => e.kind === 'API').length,
          resources: catalogEntities.filter(e => e.kind === 'Resource').length,
        };
        setStats(newStats);

      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError('Unable to load catalog data');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchCatalogData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [catalogApi]);

  if (loading) {
    return (
      <InfoCard title="BA Services Catalog" icon={<StorageIcon />}>
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress size={40} />
          <Typography variant="body2" style={{ marginLeft: 16 }}>
            Loading catalog services...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="BA Services Catalog" icon={<StorageIcon />}>
        <Box p={2} textAlign="center">
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Check Backstage catalog connection
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="BA Services Catalog (Live)" icon={<StorageIcon />}>
      {/* Stats Summary */}
      <div className={classes.statsBox}>
        <Typography variant="h6" gutterBottom>
          Catalog Overview
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Total Services: <strong>{stats.total}</strong></Typography>
          <Typography variant="body2">Components: <strong>{stats.components}</strong></Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">APIs: <strong>{stats.apis}</strong></Typography>
          <Typography variant="body2">Resources: <strong>{stats.resources}</strong></Typography>
        </Box>
      </div>

      <Divider />

      {/* Services List */}
      <List dense>
        {entities.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography color="textSecondary">
              No services found in catalog
            </Typography>
          </Box>
        ) : (
          entities.map((entity, index) => {
            const health = getServiceHealth(entity.metadata.name);
            return (
              <ListItem key={index} className={classes.serviceItem}>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    {getEntityIcon(entity)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <div>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">
                          <strong>{entity.metadata.name}</strong>
                        </Typography>
                        <Chip 
                          label={entity.kind} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <div className={classes.healthIndicator}>
                        {getHealthIcon(health.status)}
                        <Typography variant="caption" style={{ marginLeft: 8 }}>
                          {health.uptime.toFixed(1)}% uptime • {Math.round(health.responseTime)}ms
                        </Typography>
                        <Chip 
                          label={health.status.toUpperCase()} 
                          size="small" 
                          style={{ marginLeft: 8 }}
                          color={getHealthColor(health.status)}
                        />
                      </div>
                    </div>
                  }
                  secondary={
                    <div>
                      <Typography variant="caption" color="textSecondary">
                        {entity.metadata.description || `${entity.kind} managed by ${entity.spec?.owner || 'Unknown'}`}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={health.uptime} 
                        style={{ marginTop: 4, height: 4 }}
                        color={health.status === 'healthy' ? 'primary' : 'secondary'}
                      />
                    </div>
                  }
                />
              </ListItem>
            );
          })
        )}
      </List>
      
      <Box mt={1} textAlign="center">
        <Typography variant="caption" color="primary">
          🔄 Auto-refreshes every 2 minutes • Live from Backstage Catalog API
        </Typography>
      </Box>
    </InfoCard>
  );
};