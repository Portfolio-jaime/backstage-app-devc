import React, { useState, useEffect, useCallback } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TemplateIcon from '@material-ui/icons/LibraryBooks';
import CodeIcon from '@material-ui/icons/Code';
import WebIcon from '@material-ui/icons/Web';
import StorageIcon from '@material-ui/icons/Storage';
import CloudIcon from '@material-ui/icons/Cloud';
import RefreshIcon from '@material-ui/icons/Refresh';
import LaunchIcon from '@material-ui/icons/Launch';
import AddIcon from '@material-ui/icons/Add';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles((theme) => ({
  templateCard: {
    marginBottom: theme.spacing(1),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[2],
    },
  },
  templateAvatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  categoryChip: {
    margin: theme.spacing(0.25),
    fontSize: '0.7rem',
  },
  statsContainer: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  templateDescription: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  templateMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: theme.spacing(0.5),
  },
}));

interface SoftwareTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  category: string[];
  owner: string;
  spec: {
    type: string;
    parameters?: any[];
    steps?: any[];
  };
  metadata: {
    tags?: string[];
    annotations?: Record<string, string>;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface TemplateStats {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recentlyUpdated: number;
}

export const SoftwareTemplatesList: React.FC = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [templates, setTemplates] = useState<SoftwareTemplate[]>([]);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const getTemplateIcon = (type: string, category: string[]) => {
    if (category.includes('api') || type.includes('api')) {
      return <StorageIcon />;
    }
    if (category.includes('frontend') || category.includes('web') || type.includes('web')) {
      return <WebIcon />;
    }
    if (category.includes('backend') || category.includes('service')) {
      return <CodeIcon />;
    }
    if (category.includes('infrastructure') || category.includes('devops')) {
      return <CloudIcon />;
    }
    return <TemplateIcon />;
  };

  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'default' => {
    const colorMap: Record<string, 'primary' | 'secondary' | 'default'> = {
      'frontend': 'primary',
      'backend': 'secondary',
      'api': 'primary',
      'infrastructure': 'secondary',
      'devops': 'secondary',
      'microservice': 'primary',
      'web': 'primary',
      'mobile': 'secondary',
    };
    return colorMap[category.toLowerCase()] || 'default';
  };

  const convertEntityToTemplate = (entity: Entity): SoftwareTemplate => {
    return {
      id: `${entity.metadata.namespace || 'default'}/${entity.metadata.name}`,
      name: entity.metadata.name,
      title: entity.metadata.title || entity.metadata.name,
      description: entity.metadata.description || 'No description available',
      type: entity.spec?.type?.toString() || 'template',
      category: entity.metadata.tags || ['general'],
      owner: entity.spec?.owner?.toString() || entity.metadata.annotations?.['backstage.io/owner'] || 'unknown',
      spec: {
        type: entity.spec?.type?.toString() || 'template',
        parameters: (entity.spec as any)?.parameters || [],
        steps: (entity.spec as any)?.steps || [],
      },
      metadata: {
        tags: entity.metadata.tags,
        annotations: entity.metadata.annotations,
      },
      createdAt: entity.metadata.annotations?.['backstage.io/created-at'],
      updatedAt: entity.metadata.annotations?.['backstage.io/updated-at'],
    };
  };

  const fetchSoftwareTemplates = useCallback(async () => {
    try {
      console.log('📋 Fetching software templates...');

      // Fetch template entities from Backstage catalog
      const response = await catalogApi.getEntities({
        filter: {
          kind: 'Template',
        },
      });

      const templateEntities = response.items;
      const convertedTemplates = templateEntities.map(convertEntityToTemplate);

      setTemplates(convertedTemplates);

      // Calculate stats
      const categoryCount: Record<string, number> = {};
      const typeCount: Record<string, number> = {};
      let recentCount = 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      convertedTemplates.forEach(template => {
        // Count by category
        template.category.forEach(cat => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        // Count by type
        typeCount[template.type] = (typeCount[template.type] || 0) + 1;

        // Count recently updated
        if (template.updatedAt && new Date(template.updatedAt) > oneWeekAgo) {
          recentCount++;
        }
      });

      const templateStats: TemplateStats = {
        total: convertedTemplates.length,
        byCategory: categoryCount,
        byType: typeCount,
        recentlyUpdated: recentCount,
      };

      setStats(templateStats);
      setError(null);

      console.log(`📋 Loaded ${convertedTemplates.length} software templates`);

    } catch (err) {
      console.error('Error fetching software templates:', err);
      setError('Failed to load software templates');

      // Fallback mock data
      const mockTemplates: SoftwareTemplate[] = [
        {
          id: 'default/react-frontend',
          name: 'react-frontend',
          title: 'React Frontend Application',
          description: 'A modern React frontend application with TypeScript, testing, and CI/CD configured',
          type: 'frontend',
          category: ['frontend', 'web', 'react'],
          owner: 'platform-team',
          spec: {
            type: 'frontend',
            parameters: [
              { title: 'Application Name', type: 'string' },
              { title: 'Description', type: 'string' },
            ],
          },
          metadata: {
            tags: ['react', 'typescript', 'frontend'],
          },
        },
        {
          id: 'default/node-api',
          name: 'node-api',
          title: 'Node.js REST API',
          description: 'Express.js REST API with authentication, database, and OpenAPI documentation',
          type: 'backend',
          category: ['backend', 'api', 'microservice'],
          owner: 'backend-team',
          spec: {
            type: 'backend',
            parameters: [
              { title: 'Service Name', type: 'string' },
              { title: 'Database Type', type: 'choice', choices: ['postgres', 'mysql', 'mongodb'] },
            ],
          },
          metadata: {
            tags: ['nodejs', 'express', 'api'],
          },
        },
        {
          id: 'default/kubernetes-deployment',
          name: 'kubernetes-deployment',
          title: 'Kubernetes Deployment',
          description: 'Complete Kubernetes deployment with ingress, services, and monitoring',
          type: 'infrastructure',
          category: ['infrastructure', 'devops', 'kubernetes'],
          owner: 'devops-team',
          spec: {
            type: 'infrastructure',
            parameters: [
              { title: 'Application Name', type: 'string' },
              { title: 'Environment', type: 'choice', choices: ['dev', 'staging', 'prod'] },
            ],
          },
          metadata: {
            tags: ['kubernetes', 'deployment', 'infrastructure'],
          },
        },
      ];

      setTemplates(mockTemplates);
      setStats({
        total: mockTemplates.length,
        byCategory: { 'frontend': 1, 'backend': 1, 'infrastructure': 1 },
        byType: { 'frontend': 1, 'backend': 1, 'infrastructure': 1 },
        recentlyUpdated: 1,
      });
    }
  }, [catalogApi]);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      await fetchSoftwareTemplates();
      setLoading(false);
      setLastRefresh(new Date());
    };

    loadTemplates();

    // Refresh every 5 minutes
    const interval = setInterval(loadTemplates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSoftwareTemplates]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchSoftwareTemplates();
    setLoading(false);
    setLastRefresh(new Date());
  };

  const handleCreateFromTemplate = (template: SoftwareTemplate) => {
    // Navigate to scaffolder with this template
    window.open(`/create/templates/${template.name}`, '_blank');
  };

  if (loading && templates.length === 0) {
    return (
      <InfoCard
        title="📋 Software Templates"
        icon={<TemplateIcon />}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
          <Typography variant="body2" style={{ marginLeft: 16 }}>
            Loading software templates...
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title="📋 Software Templates"
      icon={<TemplateIcon />}
      action={
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            href="/create"
            target="_blank"
          >
            Create
          </Button>
          <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <Box>
        {/* Template Stats */}
        {stats && (
          <Box className={classes.statsContainer}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="h6" color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Templates
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" color="secondary">
                  {Object.keys(stats.byCategory).length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Categories
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" color="textPrimary">
                  {Object.keys(stats.byType).length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Types
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6" style={{ color: '#4caf50' }}>
                  {stats.recentlyUpdated}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Recent Updates
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Box p={2} bgcolor="rgba(244, 67, 54, 0.1)" borderRadius={1} mb={2}>
            <Typography variant="body2" color="error">
              ⚠️ {error} - Showing cached/mock templates
            </Typography>
          </Box>
        )}

        {/* Templates List */}
        <List dense>
          {templates.map((template, index) => (
            <React.Fragment key={template.id}>
              <ListItem
                className={classes.templateCard}
                onClick={() => handleCreateFromTemplate(template)}
              >
                <ListItemAvatar>
                  <Avatar className={classes.templateAvatar}>
                    {getTemplateIcon(template.type, template.category)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        {template.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="Create from template">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateFromTemplate(template);
                            }}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        className={classes.templateDescription}
                        gutterBottom
                      >
                        {template.description}
                      </Typography>

                      <Box className={classes.templateMeta}>
                        {template.category.slice(0, 3).map((cat) => (
                          <Chip
                            key={cat}
                            label={cat}
                            size="small"
                            color={getCategoryColor(cat)}
                            variant="outlined"
                            className={classes.categoryChip}
                          />
                        ))}
                        {template.category.length > 3 && (
                          <Typography variant="caption" color="textSecondary">
                            +{template.category.length - 3} more
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 4 }}>
                        👤 {template.owner} • 🔧 {template.type}
                        {template.spec.parameters && (
                          <span> • 📝 {template.spec.parameters.length} parameters</span>
                        )}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < templates.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {templates.length === 0 && !loading && (
          <Box textAlign="center" p={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              No software templates found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              href="/create"
              target="_blank"
            >
              Create Your First Template
            </Button>
          </Box>
        )}

        {/* Quick Create Button */}
        {templates.length > 0 && (
          <Box textAlign="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              href="/create"
              target="_blank"
              fullWidth
            >
              Create New Component from Template
            </Button>
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};