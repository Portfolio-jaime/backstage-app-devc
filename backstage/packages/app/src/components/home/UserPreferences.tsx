import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Select,
  MenuItem,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Divider,
  Grid,
  Paper,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsIcon from '@material-ui/icons/Settings';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import RestoreIcon from '@material-ui/icons/Restore';
import { useUserPreferences } from '../../hooks/useUserPreferences';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      maxWidth: 800,
      width: '90%',
      maxHeight: '80vh',
    },
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  setting: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  exportButton: {
    margin: theme.spacing(1),
  },
  preferencesPreview: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    maxHeight: 200,
    overflow: 'auto',
  },
}));

interface UserPreferencesProps {
  open: boolean;
  onClose: () => void;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({ open, onClose }) => {
  const classes = useStyles();
  const { 
    preferences, 
    updatePreference, 
    resetPreferences, 
    exportPreferences, 
    importPreferences 
  } = useUserPreferences();
  
  const [importData, setImportData] = useState('');

  const handleWidgetToggle = (widgetKey: string) => {
    const newVisibility = {
      ...preferences.widgetVisibility,
      [widgetKey]: !preferences.widgetVisibility[widgetKey],
    };
    updatePreference('widgetVisibility', newVisibility);
  };

  const handleRefreshIntervalChange = (widgetKey: string, interval: number) => {
    const newIntervals = {
      ...preferences.refreshIntervals,
      [widgetKey]: interval,
    };
    updatePreference('refreshIntervals', newIntervals);
  };

  const handleExport = () => {
    const data = exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backstage-preferences-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importPreferences(importData)) {
      setImportData('');
      alert('Preferences imported successfully!');
    } else {
      alert('Failed to import preferences. Please check the format.');
    }
  };

  const refreshIntervalOptions = [
    { value: 1000, label: '1 second' },
    { value: 5000, label: '5 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
    { value: 120000, label: '2 minutes' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 1800000, label: '30 minutes' },
  ];

  const availableWidgets = [
    { key: 'worldClock', name: 'World Clock', description: 'Global timezone display' },
    { key: 'github', name: 'GitHub Activity', description: 'Repository activity and stats' },
    { key: 'catalog', name: 'Service Catalog', description: 'Backstage service catalog' },
    { key: 'systemHealth', name: 'System Health', description: 'System status monitoring' },
    { key: 'security', name: 'Security Alerts', description: 'Security monitoring' },
    { key: 'costDashboard', name: 'Cost Dashboard', description: 'Cost tracking and budgets' },
    { key: 'metrics', name: 'Real Metrics', description: 'Repository metrics and analytics' },
    { key: 'flightOps', name: 'Flight Operations', description: 'Flight tracking (simulated)' },
  ];

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog}>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SettingsIcon style={{ marginRight: 8 }} />
          User Preferences
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* General Settings */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🎨 General Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl className={classes.setting} fullWidth>
                  <FormLabel>Default Dashboard</FormLabel>
                  <Select
                    value={preferences.defaultDashboard}
                    onChange={(e) => updatePreference('defaultDashboard', e.target.value as string)}
                    size="small"
                  >
                    <MenuItem value="ba-main">Main Dashboard</MenuItem>
                    <MenuItem value="ba-devops">DevOps Dashboard</MenuItem>
                    <MenuItem value="ba-platform">Platform Dashboard</MenuItem>
                    <MenuItem value="ba-security">Security Dashboard</MenuItem>
                    <MenuItem value="ba-management">Management Dashboard</MenuItem>
                    <MenuItem value="ba-developer">Developer Dashboard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl className={classes.setting}>
                  <FormLabel>Theme Preference</FormLabel>
                  <RadioGroup
                    value={preferences.themePreference}
                    onChange={(e) => updatePreference('themePreference', e.target.value as 'light' | 'dark' | 'auto')}
                    row
                  >
                    <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
                    <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
                    <FormControlLabel value="auto" control={<Radio size="small" />} label="Auto" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.compactMode}
                        onChange={(e) => updatePreference('compactMode', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Compact Mode"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.showDebugInfo}
                        onChange={(e) => updatePreference('showDebugInfo', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Show Debug Info"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.autoRefresh}
                        onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Auto Refresh"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.enabled}
                        onChange={(e) => updatePreference('notifications', { 
                          ...preferences.notifications, 
                          enabled: e.target.checked 
                        })}
                        size="small"
                      />
                    }
                    label="Notifications"
                  />
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Widget Configuration */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🧩 Widget Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Configure which widgets appear on your dashboards and their refresh intervals
            </Typography>
            
            {availableWidgets.map((widget) => (
              <Paper key={widget.key} style={{ padding: 16, margin: '8px 0' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.widgetVisibility[widget.key] || false}
                            onChange={() => handleWidgetToggle(widget.key)}
                            size="small"
                          />
                        }
                        label={widget.name}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {widget.description}
                    </Typography>
                  </Box>
                  
                  {preferences.widgetVisibility[widget.key] && (
                    <FormControl size="small" style={{ minWidth: 120 }}>
                      <Select
                        value={preferences.refreshIntervals[widget.key] || 300000}
                        onChange={(e) => handleRefreshIntervalChange(widget.key, e.target.value as number)}
                      >
                        {refreshIntervalOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Import/Export */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">💾 Backup & Restore</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Export your preferences to backup or share with others:
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={handleExport}
                  className={classes.exportButton}
                >
                  Export Preferences
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={resetPreferences}
                  className={classes.exportButton}
                  color="secondary"
                >
                  Reset to Defaults
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Import preferences from a backup:
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  variant="outlined"
                  fullWidth
                  placeholder="Paste exported preferences JSON here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  size="small"
                />
                <Box mt={1}>
                  <Button
                    variant="outlined"
                    startIcon={<PublishIcon />}
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    size="small"
                  >
                    Import Preferences
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Current Configuration Preview */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🔍 Current Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre className={classes.preferencesPreview}>
              {JSON.stringify(preferences, null, 2)}
            </pre>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};