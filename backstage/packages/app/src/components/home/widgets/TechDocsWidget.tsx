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

// Mock data específica del equipo DevOps
const MOCK_DEVOPS_TECHDOCS: TechDoc[] = [
  {
    id: 'kubernetes-runbook',
    title: 'Kubernetes Operations Runbook',
    description: 'Complete guide for Kubernetes cluster operations and troubleshooting',
    category: 'runbooks',
    owner: 'jaime.henao@ba.com',
    lastUpdated: '2025-01-15T08:30:00Z',
    url: '/docs/kubernetes-runbook',
    tags: ['kubernetes', 'devops', 'infrastructure'],
  },
  {
    id: 'ci-cd-pipeline-guide',
    title: 'CI/CD Pipeline Configuration',
    description: 'Setup and configuration guide for GitHub Actions pipelines',
    category: 'ci-cd-guides',
    owner: 'devops-team',
    lastUpdated: '2025-01-14T16:45:00Z',
    url: '/docs/ci-cd-pipeline-guide',
    tags: ['ci-cd', 'github-actions', 'deployment'],
  },
  {
    id: 'terraform-infrastructure',
    title: 'Terraform Infrastructure as Code',
    description: 'Infrastructure provisioning and management with Terraform',
    category: 'infrastructure',
    owner: 'devops1@ba.com',
    lastUpdated: '2025-01-14T14:20:00Z',
    url: '/docs/terraform-infrastructure',
    tags: ['terraform', 'infrastructure', 'iac'],
  },
  {
    id: 'monitoring-setup',
    title: 'Monitoring & Alerting Setup',
    description: 'Prometheus, Grafana, and alerting configuration',
    category: 'monitoring',
    owner: 'devops2@ba.com',
    lastUpdated: '2025-01-13T11:15:00Z',
    url: '/docs/monitoring-setup',
    tags: ['monitoring', 'prometheus', 'grafana'],
  },
  {
    id: 'deployment-strategies',
    title: 'Deployment Strategies & Best Practices',
    description: 'Blue-green, canary, and rolling deployment strategies',
    category: 'deployment-guides',
    owner: 'jaime.henao@ba.com',
    lastUpdated: '2025-01-12T09:30:00Z',
    url: '/docs/deployment-strategies',
    tags: ['deployment', 'devops', 'strategies'],
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
  const [docs, setDocs] = useState<TechDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { config } = useDashboardConfig();

  console.log('📚 TechDocsWidget mounted and rendering!');

  useEffect(() => {
    const fetchTechDocs = async () => {
      setLoading(true);
      console.log('📚 Fetching TechDocs...');

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use filtered docs
      const filteredDocs = MOCK_DEVOPS_TECHDOCS.slice(0, 5);
      setDocs(filteredDocs);
      setLoading(false);

      console.log('📚 TechDocs loaded:', filteredDocs.length);
    };

    fetchTechDocs();
  }, [config]);

  if (loading) {
    return (
      <Card className={classes.card}>
        <CardHeader title="📚 DevOps Documentation" />
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