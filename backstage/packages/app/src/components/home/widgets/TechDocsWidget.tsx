import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Link,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DescriptionIcon from '@material-ui/icons/Description';
import PersonIcon from '@material-ui/icons/Person';
import UpdateIcon from '@material-ui/icons/Update';
import { useDashboardConfig } from '../../../hooks/useDashboardConfig';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  docItem: {
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  categoryChip: {
    margin: theme.spacing(0.5),
    fontSize: '0.75rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
}));

interface TechDoc {
  id: string;
  title: string;
  description?: string;
  category: string;
  owner: string;
  lastUpdated: string;
  url: string;
  tags: string[];
}

// Fallback documentation for when no real docs are found
const getFallbackDocs = (): TechDoc[] => [
  {
    id: 'backstage-docs',
    title: 'Backstage Documentation',
    description: 'Complete Backstage platform documentation',
    category: 'platform-docs',
    owner: 'platform-team',
    lastUpdated: new Date().toISOString(),
    url: '/docs',
    tags: ['backstage', 'platform', 'documentation'],
  },
  {
    id: 'catalog-docs',
    title: 'Service Catalog Guide',
    description: 'How to use and maintain the service catalog',
    category: 'platform-docs',
    owner: 'platform-team',
    lastUpdated: new Date().toISOString(),
    url: '/catalog',
    tags: ['catalog', 'services', 'platform'],
  },
];

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'runbooks': return '📖';
    case 'infrastructure': return '🏗️';
    case 'deployment-guides': return '🚀';
    case 'monitoring': return '📊';
    case 'troubleshooting': return '🔧';
    case 'ci-cd-guides': return '⚙️';
    case 'platform-docs': return '🌐';
    default: return '📄';
  }
};

const getCategoryColor = (category: string): 'primary' | 'secondary' | 'default' => {
  const colors = {
    'runbooks': 'primary',
    'infrastructure': 'secondary',
    'deployment-guides': 'primary',
    'monitoring': 'secondary',
    'troubleshooting': 'default',
    'ci-cd-guides': 'primary',
    'platform-docs': 'secondary',
  };
  return colors[category as keyof typeof colors] || 'default';
};

export const TechDocsWidget: React.FC = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [docs, setDocs] = useState<TechDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useDashboardConfig();

  console.log('📚 TechDocsWidget mounted and rendering!');

  const convertEntityToTechDoc = (entity: Entity): TechDoc => {
    const namespace = entity.metadata.namespace || 'default';
    const kind = entity.kind.toLowerCase();
    const name = entity.metadata.name;

    return {
      id: `${namespace}/${kind}/${name}`,
      title: entity.metadata.title || entity.metadata.name,
      description: entity.metadata.description || `Documentation for ${entity.metadata.name}`,
      category: entity.metadata.tags?.find(tag =>
        ['runbooks', 'infrastructure', 'deployment-guides', 'monitoring', 'ci-cd-guides'].includes(tag)
      ) || 'platform-docs',
      owner: entity.spec?.owner?.toString() || entity.metadata.annotations?.['backstage.io/owner'] || 'unknown',
      lastUpdated: entity.metadata.annotations?.['backstage.io/updated'] || new Date().toISOString(),
      url: `/docs/${namespace}/${kind}/${name}`,
      tags: entity.metadata.tags || [],
    };
  };

  useEffect(() => {
    const fetchTechDocs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📚 Fetching TechDocs from catalog...');

        // Fetch entities that have TechDocs
        const response = await catalogApi.getEntities({
          filter: {
            'metadata.annotations.backstage.io/techdocs-ref': '*',
          },
        });

        let techDocsEntities = response.items;

        // Apply team filtering if configured
        const techDocsConfig = config?.spec?.widgets?.techdocs;
        if (techDocsConfig?.teamFilter) {
          techDocsEntities = techDocsEntities.filter(entity => {
            const owner = entity.spec?.owner?.toString() || '';
            const tags = entity.metadata.tags || [];

            return owner.includes(techDocsConfig.teamFilter) ||
                   tags.includes(techDocsConfig.teamFilter);
          });
        }

        // Apply additional filters from config
        if (techDocsConfig?.filters?.tags) {
          techDocsEntities = techDocsEntities.filter(entity => {
            const entityTags = entity.metadata.tags || [];
            return techDocsConfig.filters.tags.some(tag =>
              entityTags.includes(tag)
            );
          });
        }

        // Convert entities to TechDoc format
        const convertedDocs = techDocsEntities
          .slice(0, techDocsConfig?.displayOptions?.maxDocs || 6)
          .map(convertEntityToTechDoc);

        if (convertedDocs.length > 0) {
          setDocs(convertedDocs);
          console.log(`📚 Loaded ${convertedDocs.length} real TechDocs`);
        } else {
          // Use fallback docs if no real docs found
          console.log('📚 No TechDocs found, using fallback docs');
          setDocs(getFallbackDocs());
        }

      } catch (err) {
        console.error('Error fetching TechDocs:', err);
        setError('Unable to load documentation');
        // Use fallback docs on error
        setDocs(getFallbackDocs());
      } finally {
        setLoading(false);
      }
    };

    fetchTechDocs();

    // Refresh every 5 minutes
    const interval = setInterval(fetchTechDocs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [config, catalogApi]);

  if (loading) {
    return (
      <Card className={classes.card}>
        <CardHeader title="📚 Documentation" />
        <CardContent>
          <Box className={classes.loading}>
            <CircularProgress size={40} />
            <Typography variant="body2" style={{ marginLeft: 16 }}>
              Loading documentation...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={classes.card}>
      <CardHeader
        title="📚 DevOps Team Documentation"
        subheader={`${docs.length} documents available`}
      />
      <CardContent className={classes.content}>
        <List dense>
          {docs.map((doc, index) => (
            <React.Fragment key={doc.id}>
              <ListItem className={classes.docItem}>
                <ListItemIcon>
                  <Box fontSize="1.2rem">
                    {getCategoryIcon(doc.category)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link
                      href={doc.url}
                      color="inherit"
                      underline="hover"
                      style={{ fontWeight: 500 }}
                    >
                      {doc.title}
                    </Link>
                  }
                  secondary={
                    <Box>
                      {doc.description && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {doc.description}
                        </Typography>
                      )}
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Chip
                          label={doc.category.replace('-', ' ')}
                          size="small"
                          color={getCategoryColor(doc.category)}
                          variant="outlined"
                          className={classes.categoryChip}
                        />
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PersonIcon fontSize="small" color="disabled" />
                          <Typography variant="caption" color="textSecondary">
                            {doc.owner.split('@')[0]}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <UpdateIcon fontSize="small" color="disabled" />
                          <Typography variant="caption" color="textSecondary">
                            {formatRelativeTime(doc.lastUpdated)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < docs.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>

        {docs.length === 0 && (
          <Box textAlign="center" py={4}>
            <DescriptionIcon fontSize="large" color="disabled" />
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
              No documentation found for this team
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};