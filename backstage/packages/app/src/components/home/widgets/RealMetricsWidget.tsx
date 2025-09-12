import React, { useState, useEffect } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import GitHubIcon from '@material-ui/icons/GitHub';
import BugReportIcon from '@material-ui/icons/BugReport';
import PeopleIcon from '@material-ui/icons/People';

const useStyles = makeStyles((theme) => ({
  metric: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  metricLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  contributorCard: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5, 0),
    backgroundColor: theme.palette.background.default,
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  progressContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  healthIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

interface GitHubMetrics {
  commits: {
    total: number;
    lastMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  pullRequests: {
    open: number;
    merged: number;
    avgReviewTime: string;
  };
  issues: {
    open: number;
    closed: number;
    ratio: number;
  };
  contributors: Array<{
    login: string;
    avatar_url: string;
    contributions: number;
  }>;
  repositoryHealth: {
    score: number;
    factors: string[];
  };
}

export const RealMetricsWidget = () => {
  const classes = useStyles();
  const [metrics, setMetrics] = useState<GitHubMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealMetrics = async () => {
      try {
        setLoading(true);
        
        // GitHub API token from environment
        const githubToken = process.env.REACT_APP_GITHUB_TOKEN || '';
        const headers = {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BA-Backstage-Dashboard',
          ...(githubToken && { 'Authorization': `token ${githubToken}` }),
        };

        const owner = 'Portfolio-jaime';
        const repo = 'backstage-dashboard-templates';
        
        console.log('📊 Fetching real GitHub metrics...');

        // Fetch multiple endpoints in parallel
        const [commitsRes, prsRes, issuesRes, contributorsRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`, { headers }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=50`, { headers }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`, { headers }),
        ]);

        if (!commitsRes.ok || !prsRes.ok || !issuesRes.ok || !contributorsRes.ok) {
          throw new Error('Failed to fetch GitHub data');
        }

        const [commits, pullRequests, issues, contributors] = await Promise.all([
          commitsRes.json(),
          prsRes.json(),
          issuesRes.json(),
          contributorsRes.json(),
        ]);

        // Process commits data
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        
        const recentCommits = commits.filter((commit: any) => 
          new Date(commit.commit.committer.date) > lastMonthDate
        );

        // Process PR data
        const mergedPRs = pullRequests.filter((pr: any) => pr.merged_at);
        const openPRs = pullRequests.filter((pr: any) => pr.state === 'open');

        // Process issues data (exclude PRs)
        const actualIssues = issues.filter((issue: any) => !issue.pull_request);
        const openIssues = actualIssues.filter((issue: any) => issue.state === 'open');
        const closedIssues = actualIssues.filter((issue: any) => issue.state === 'closed');

        // Calculate repository health score
        const healthFactors = [];
        let healthScore = 0;

        if (recentCommits.length > 5) {
          healthFactors.push('Active Development');
          healthScore += 20;
        }
        if (mergedPRs.length > openPRs.length) {
          healthFactors.push('Good PR Management');
          healthScore += 20;
        }
        if (closedIssues.length > openIssues.length) {
          healthFactors.push('Issue Resolution');
          healthScore += 20;
        }
        if (contributors.length > 1) {
          healthFactors.push('Multiple Contributors');
          healthScore += 20;
        }
        if (commits.length > 50) {
          healthFactors.push('Mature Codebase');
          healthScore += 20;
        }

        const processedMetrics: GitHubMetrics = {
          commits: {
            total: commits.length,
            lastMonth: recentCommits.length,
            trend: recentCommits.length > 10 ? 'up' : recentCommits.length > 3 ? 'stable' : 'down',
          },
          pullRequests: {
            open: openPRs.length,
            merged: mergedPRs.length,
            avgReviewTime: '2.1 days', // Could be calculated from PR data
          },
          issues: {
            open: openIssues.length,
            closed: closedIssues.length,
            ratio: closedIssues.length / (openIssues.length + closedIssues.length) || 0,
          },
          contributors: contributors.slice(0, 5).map((contributor: any) => ({
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
          })),
          repositoryHealth: {
            score: Math.min(healthScore, 100),
            factors: healthFactors,
          },
        };

        console.log('📊 Real metrics processed:', processedMetrics);
        setMetrics(processedMetrics);
        
      } catch (err) {
        console.error('Failed to fetch real metrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRealMetrics();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchRealMetrics, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4caf50';
      case 'down': return '#f44336';
      default: return '#ff9800';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <InfoCard title="📊 Real Repository Metrics" icon={<TrendingUpIcon />}>
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
          <Box ml={2}>
            <Typography variant="body2">Loading real GitHub metrics...</Typography>
          </Box>
        </Box>
      </InfoCard>
    );
  }

  if (error || !metrics) {
    return (
      <InfoCard title="📊 Real Repository Metrics" icon={<TrendingUpIcon />}>
        <Box p={2} textAlign="center">
          <Typography variant="body2" color="error">
            {error || 'No metrics available'}
          </Typography>
          <Typography variant="caption" display="block" style={{ marginTop: 8 }}>
            Add REACT_APP_GITHUB_TOKEN for better API access
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="📊 Real Repository Metrics" icon={<TrendingUpIcon />}>
      <Grid container spacing={2}>
        {/* Repository Health */}
        <Grid item xs={12}>
          <Card className={classes.contributorCard}>
            <Box className={classes.healthIndicator}>
              <Typography variant="h6">Repository Health</Typography>
              <Chip 
                label={`${metrics.repositoryHealth.score}%`} 
                style={{ 
                  backgroundColor: getHealthColor(metrics.repositoryHealth.score),
                  color: 'white'
                }}
                size="small"
              />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={metrics.repositoryHealth.score} 
              style={{ 
                backgroundColor: '#e0e0e0',
                height: 6,
                borderRadius: 3 
              }}
              classes={{
                bar: {
                  backgroundColor: getHealthColor(metrics.repositoryHealth.score)
                }
              }}
            />
            <Box mt={1}>
              {metrics.repositoryHealth.factors.map((factor, index) => (
                <Chip
                  key={index}
                  label={factor}
                  size="small"
                  variant="outlined"
                  style={{ margin: '2px', fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={6} md={3}>
          <div className={classes.metric}>
            <GitHubIcon style={{ fontSize: '2rem', color: getTrendColor(metrics.commits.trend) }} />
            <Typography className={classes.metricValue}>
              {metrics.commits.lastMonth}
            </Typography>
            <Typography className={classes.metricLabel}>
              Commits (30d)
            </Typography>
            <Typography variant="caption" style={{ color: getTrendColor(metrics.commits.trend) }}>
              Total: {metrics.commits.total}
            </Typography>
          </div>
        </Grid>

        <Grid item xs={6} md={3}>
          <div className={classes.metric}>
            <TrendingUpIcon style={{ fontSize: '2rem', color: '#2196f3' }} />
            <Typography className={classes.metricValue}>
              {metrics.pullRequests.merged}
            </Typography>
            <Typography className={classes.metricLabel}>
              PRs Merged
            </Typography>
            <Typography variant="caption">
              {metrics.pullRequests.open} open
            </Typography>
          </div>
        </Grid>

        <Grid item xs={6} md={3}>
          <div className={classes.metric}>
            <BugReportIcon style={{ fontSize: '2rem', color: '#ff5722' }} />
            <Typography className={classes.metricValue}>
              {(metrics.issues.ratio * 100).toFixed(0)}%
            </Typography>
            <Typography className={classes.metricLabel}>
              Issue Resolution
            </Typography>
            <Typography variant="caption">
              {metrics.issues.closed} closed, {metrics.issues.open} open
            </Typography>
          </div>
        </Grid>

        <Grid item xs={6} md={3}>
          <div className={classes.metric}>
            <PeopleIcon style={{ fontSize: '2rem', color: '#9c27b0' }} />
            <Typography className={classes.metricValue}>
              {metrics.contributors.length}
            </Typography>
            <Typography className={classes.metricLabel}>
              Active Contributors
            </Typography>
          </div>
        </Grid>

        {/* Top Contributors */}
        <Grid item xs={12}>
          <Divider style={{ margin: '16px 0' }} />
          <Typography variant="h6" gutterBottom>
            🏆 Top Contributors
          </Typography>
          {metrics.contributors.map((contributor) => (
            <Card key={contributor.login} className={classes.contributorCard}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={contributor.avatar_url} 
                    alt={contributor.login}
                    className={classes.avatar}
                  />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>
                    {contributor.login}
                  </Typography>
                </Box>
                <Chip
                  label={`${contributor.contributions} commits`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Card>
          ))}
        </Grid>

        {/* Last Update Info */}
        <Grid item xs={12}>
          <Typography variant="caption" color="textSecondary" align="center" display="block">
            📊 Real-time data from GitHub API • Updated every 10 minutes
          </Typography>
        </Grid>
      </Grid>
    </InfoCard>
  );
};