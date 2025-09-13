import React, { useState, useEffect } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Typography,
  Box,
  IconButton,
  Chip,
  Card,
  CardContent,
  Fade,
  LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import InfoIcon from '@material-ui/icons/Info';
import CodeIcon from '@material-ui/icons/Code';
import SecurityIcon from '@material-ui/icons/Security';
import SpeedIcon from '@material-ui/icons/Speed';
import GroupWorkIcon from '@material-ui/icons/GroupWork';

const useStyles = makeStyles((theme) => ({
  tipCard: {
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
  },
  tipHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  tipContent: {
    lineHeight: 1.6,
    marginBottom: theme.spacing(2),
  },
  tipFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  categoryChip: {
    fontSize: '0.75rem',
    height: 24,
  },
  refreshButton: {
    padding: 4,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  progress: {
    marginTop: theme.spacing(1),
    height: 4,
    borderRadius: 2,
  },
}));

interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: 'development' | 'security' | 'performance' | 'collaboration' | 'devops';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source?: string;
  tags: string[];
}

const DAILY_TIPS: DailyTip[] = [
  {
    id: 'git-commit-1',
    title: 'Write Better Git Commit Messages',
    content: 'Use the imperative mood in commit messages: "Fix bug" instead of "Fixed bug". This matches the style of auto-generated commits like merges.',
    category: 'development',
    difficulty: 'beginner',
    tags: ['git', 'best-practices'],
  },
  {
    id: 'security-1',
    title: 'Environment Variables for Secrets',
    content: 'Never hardcode API keys or secrets in your code. Always use environment variables and never commit .env files to version control.',
    category: 'security',
    difficulty: 'beginner',
    tags: ['security', 'api-keys', 'environment'],
  },
  {
    id: 'performance-1',
    title: 'Database Query Optimization',
    content: 'Use database indexes for frequently queried columns. A well-placed index can reduce query time from seconds to milliseconds.',
    category: 'performance',
    difficulty: 'intermediate',
    tags: ['database', 'optimization', 'indexes'],
  },
  {
    id: 'devops-1',
    title: 'Container Health Checks',
    content: 'Always include health check endpoints in your containerized applications. This enables orchestrators like Kubernetes to automatically restart unhealthy containers.',
    category: 'devops',
    difficulty: 'intermediate',
    tags: ['docker', 'kubernetes', 'monitoring'],
  },
  {
    id: 'collaboration-1',
    title: 'Code Review Best Practices',
    content: 'Keep pull requests small (under 400 lines changed). Smaller PRs get reviewed faster and have fewer bugs.',
    category: 'collaboration',
    difficulty: 'beginner',
    tags: ['code-review', 'pull-requests', 'teamwork'],
  },
  {
    id: 'development-1',
    title: 'API Versioning Strategy',
    content: 'Version your APIs from day one, even v1. Use semantic versioning and maintain backward compatibility within major versions.',
    category: 'development',
    difficulty: 'intermediate',
    tags: ['api', 'versioning', 'backward-compatibility'],
  },
  {
    id: 'security-2',
    title: 'Implement Rate Limiting',
    content: 'Protect your APIs with rate limiting to prevent abuse and DDoS attacks. Use tools like Redis for distributed rate limiting.',
    category: 'security',
    difficulty: 'intermediate',
    tags: ['api', 'security', 'rate-limiting', 'redis'],
  },
  {
    id: 'performance-2',
    title: 'Caching Strategies',
    content: 'Implement caching at multiple levels: browser cache, CDN, application cache, and database cache. Each level serves different purposes.',
    category: 'performance',
    difficulty: 'advanced',
    tags: ['caching', 'cdn', 'optimization'],
  },
  {
    id: 'devops-2',
    title: 'Infrastructure as Code',
    content: 'Manage infrastructure using code (Terraform, CloudFormation). This enables version control, automated deployments, and consistent environments.',
    category: 'devops',
    difficulty: 'intermediate',
    tags: ['infrastructure', 'terraform', 'automation'],
  },
  {
    id: 'collaboration-2',
    title: 'Documentation as Code',
    content: 'Keep documentation close to code. Use markdown files in your repository and tools like GitHub Pages or GitBook for publishing.',
    category: 'collaboration',
    difficulty: 'beginner',
    tags: ['documentation', 'markdown', 'knowledge-sharing'],
  },
];

export const DailyTipsWidget = () => {
  const classes = useStyles();
  const [currentTip, setCurrentTip] = useState<DailyTip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'development': return <CodeIcon />;
      case 'security': return <SecurityIcon />;
      case 'performance': return <SpeedIcon />;
      case 'collaboration': return <GroupWorkIcon />;
      case 'devops': return <GroupWorkIcon />;
      default: return <InfoIcon />;
    }
  };

  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'default' => {
    switch (category) {
      case 'development': return 'primary';
      case 'security': return 'secondary';
      case 'performance': return 'default';
      case 'collaboration': return 'primary';
      case 'devops': return 'secondary';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
    return DAILY_TIPS[randomIndex];
  };

  const loadNewTip = async () => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTip = getRandomTip();
    setCurrentTip(newTip);
    setIsLoading(false);
    
    console.log('💡 New tip loaded:', newTip.title);
  };

  useEffect(() => {
    // Load initial tip
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('daily-tip-date');
    const storedTipId = localStorage.getItem('daily-tip-id');
    
    if (storedDate === today && storedTipId) {
      // Use today's tip if already loaded
      const tip = DAILY_TIPS.find(t => t.id === storedTipId) || getRandomTip();
      setCurrentTip(tip);
      console.log('💡 Using cached daily tip:', tip.title);
    } else {
      // Get new tip for today
      const tip = getRandomTip();
      setCurrentTip(tip);
      localStorage.setItem('daily-tip-date', today);
      localStorage.setItem('daily-tip-id', tip.id);
      console.log('💡 New daily tip selected:', tip.title);
    }
  }, []);

  if (!currentTip) {
    return (
      <InfoCard title="💡 Daily Developer Tip" icon={<InfoIcon />}>
        <Box p={2} textAlign="center">
          <Typography variant="body2">Loading tip...</Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="💡 Daily Developer Tip" icon={<InfoIcon />}>
      <Fade in={!isLoading} timeout={300}>
        <Card className={classes.tipCard}>
          <CardContent>
            {isLoading && <LinearProgress className={classes.progress} />}
            
            <div className={classes.tipHeader}>
              <Box display="flex" alignItems="center">
                <span className={classes.icon}>
                  {getCategoryIcon(currentTip.category)}
                </span>
                <Typography variant="h6" component="h3">
                  {currentTip.title}
                </Typography>
              </Box>
              
              <IconButton
                size="small"
                onClick={loadNewTip}
                disabled={isLoading}
                className={classes.refreshButton}
                title="Get new tip"
              >
                <RefreshIcon />
              </IconButton>
            </div>

            <Typography variant="body2" className={classes.tipContent}>
              {currentTip.content}
            </Typography>

            <div className={classes.tipFooter}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={currentTip.category}
                  size="small"
                  color={getCategoryColor(currentTip.category)}
                  variant="outlined"
                  className={classes.categoryChip}
                />
                <Chip
                  label={currentTip.difficulty}
                  size="small"
                  style={{
                    backgroundColor: getDifficultyColor(currentTip.difficulty),
                    color: 'white',
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              </Box>

              <Typography variant="caption" color="textSecondary">
                {currentTip.tags.join(' • ')}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Fade>

      <Box mt={1} textAlign="center">
        <Typography variant="caption" color="textSecondary">
          🚀 Tip refreshes daily • Click refresh for more
        </Typography>
      </Box>
    </InfoCard>
  );
};