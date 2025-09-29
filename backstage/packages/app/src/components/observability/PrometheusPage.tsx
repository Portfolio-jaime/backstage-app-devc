import React, { useState, useEffect } from 'react';
import { Page, Header, Content, InfoCard } from '@backstage/core-components';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
  AppBar,
} from '@material-ui/core';
import {
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
} from '@material-ui/icons';

interface PrometheusMetric {
  metric: { [key: string]: string };
  value: [number, string];
}

interface PrometheusAlert {
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
  state: 'pending' | 'firing' | 'inactive';
  activeAt?: string;
  value: string;
}

export const PrometheusPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState<PrometheusMetric[]>([]);
  const [alerts, setAlerts] = useState<PrometheusAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const prometheusUrl = process.env.REACT_APP_PROMETHEUS_URL || process.env.REACT_APP_PROMETHEUS_URL_LOCAL || 'http://localhost:9090';

  const fetchPrometheusData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      const healthResponse = await fetch(`${prometheusUrl}/api/v1/status/buildinfo`);
      if (!healthResponse.ok) {
        throw new Error('Unable to connect to Prometheus');
      }
      setConnected(true);

      // Fetch some basic metrics
      const metricsResponse = await fetch(`${prometheusUrl}/api/v1/query?query=up`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data?.result || []);
      }

      // Fetch alerts
      const alertsResponse = await fetch(`${prometheusUrl}/api/v1/alerts`);
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data?.alerts || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Prometheus data');
      setConnected(false);

      // Mock data for development
      setMetrics([
        {
          metric: { __name__: 'up', job: 'kubernetes-nodes', instance: 'node-1' },
          value: [Date.now() / 1000, '1']
        },
        {
          metric: { __name__: 'up', job: 'kubernetes-pods', instance: 'pod-1' },
          value: [Date.now() / 1000, '1']
        }
      ]);

      setAlerts([
        {
          labels: { alertname: 'HighMemoryUsage', severity: 'warning' },
          annotations: { summary: 'High memory usage detected' },
          state: 'firing',
          value: '85'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrometheusData();
  }, []);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const OverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📊 Prometheus Status</Typography>
            <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
              <Chip
                label={connected ? '✅ Connected' : '❌ Disconnected'}
                color={connected ? 'primary' : 'secondary'}
                size="small"
              />
              <Chip label={`${metrics.length} Active Targets`} color="default" size="small" />
              <Chip label={`${alerts.filter(a => a.state === 'firing').length} Firing Alerts`} color="secondary" size="small" />
              <Chip label={`URL: ${prometheusUrl}`} color="default" size="small" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🎯 Target Status</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Job</strong></TableCell>
                    <TableCell><strong>Instance</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.slice(0, 10).map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell>{metric.metric.job || 'unknown'}</TableCell>
                      <TableCell>{metric.metric.instance || 'unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={metric.value[1] === '1' ? 'UP' : 'DOWN'}
                          color={metric.value[1] === '1' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🚨 Active Alerts</Typography>
            {alerts.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No alerts currently firing</Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Alert</strong></TableCell>
                      <TableCell><strong>Severity</strong></TableCell>
                      <TableCell><strong>State</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.slice(0, 5).map((alert, index) => (
                      <TableRow key={index}>
                        <TableCell>{alert.labels.alertname}</TableCell>
                        <TableCell>
                          <Chip
                            label={alert.labels.severity}
                            color={alert.labels.severity === 'critical' ? 'secondary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={alert.state}
                            color={alert.state === 'firing' ? 'secondary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const MetricsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📈 Key Metrics</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Connect to Prometheus at {prometheusUrl} to view detailed metrics and create custom dashboards.
            </Typography>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(`${prometheusUrl}/graph`, '_blank')}
                startIcon={<TimelineIcon />}
              >
                Open Prometheus UI
              </Button>
            </Box>

            {connected && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>Sample Queries:</Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace', marginBottom: 8 }}>
                  • CPU Usage: <code>100 - (avg by (instance) (rate(node_cpu_seconds_total{`{mode="idle"}`}[5m])) * 100)</code>
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace', marginBottom: 8 }}>
                  • Memory Usage: <code>node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes</code>
                </Typography>
                <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                  • Pod Count: <code>kube_pod_info</code>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Page themeId="tool">
      <Header
        title="Prometheus Monitoring"
        subtitle={`Metrics and alerting • ${connected ? '🟢 Connected' : '🔴 Disconnected'} • ${prometheusUrl}`}
      >
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchPrometheusData}
          size="small"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Header>
      <Content>
        {error && !connected && (
          <Box mb={2}>
            <InfoCard title="Connection Warning">
              <Typography color="textSecondary">
                Unable to connect to Prometheus at {prometheusUrl}.
                Make sure Prometheus is running and accessible.
              </Typography>
            </InfoCard>
          </Box>
        )}

        <AppBar position="static" color="default" elevation={1}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<AssessmentIcon />} label="Overview" />
            <Tab icon={<TimelineIcon />} label="Metrics" />
            <Tab icon={<WarningIcon />} label="Alerts" />
          </Tabs>
        </AppBar>

        <Box mt={3}>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <MetricsTab />}
          {activeTab === 2 && (
            <Typography variant="h6">🚨 Alerts Management - Coming Soon</Typography>
          )}
        </Box>
      </Content>
    </Page>
  );
};