import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
    height: 'fit-content',
  },
  selector: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
    },
  },
  templateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  templateIcon: {
    fontSize: '1.2em',
    marginRight: theme.spacing(0.5),
  },
  templateName: {
    fontWeight: 500,
  },
  templateDescription: {
    fontSize: '0.85em',
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(3),
  },
  categoryChip: {
    height: 20,
    fontSize: '0.7em',
    marginLeft: theme.spacing(1),
  },
}));

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configPath: string;
  icon?: string;
  target: 'devops' | 'platform' | 'security' | 'management' | 'developer';
}

interface DashboardSelectorProps {
  availableTemplates: DashboardTemplate[];
  currentTemplate: DashboardTemplate | null;
  onTemplateChange: (templateId: string) => void;
  loading?: boolean;
}

export const DashboardSelector: React.FC<DashboardSelectorProps> = ({
  availableTemplates,
  currentTemplate,
  onTemplateChange,
  loading = false,
}) => {
  const classes = useStyles();

  const getCategoryColor = (category: string) => {
    const colors = {
      'Operations': 'primary',
      'Engineering': 'secondary',
      'Security': 'default',
      'Management': 'primary',
      'Development': 'secondary',
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  return (
    <Box className={classes.container}>
      <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
        Dashboard Selector
      </Typography>
      
      <FormControl variant="outlined" className={classes.selector} size="small">
        <InputLabel id="dashboard-selector-label">Select Dashboard</InputLabel>
        <Select
          labelId="dashboard-selector-label"
          value={currentTemplate?.id || ''}
          onChange={(event) => onTemplateChange(event.target.value as string)}
          label="Select Dashboard"
          disabled={loading}
        >
          {availableTemplates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <span style={{ fontSize: '1.2em' }}>
                  {template.icon || '📊'}
                </span>
                <Box flex={1}>
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    {template.name}
                  </Typography>
                </Box>
                <Chip
                  label={template.category}
                  size="small"
                  color={getCategoryColor(template.category) as any}
                  variant="outlined"
                  style={{ height: 18, fontSize: '0.7em' }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentTemplate && (
        <Box mt={2} p={2} style={{ 
          backgroundColor: 'rgba(25, 118, 210, 0.08)', 
          borderRadius: 8,
          border: '1px solid rgba(25, 118, 210, 0.2)'
        }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <span style={{ fontSize: '1.5em' }}>{currentTemplate.icon}</span>
            <Typography variant="body1" style={{ fontWeight: 600, color: '#1976d2' }}>
              {currentTemplate.name}
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary">
            <strong>Category:</strong> {currentTemplate.category} Dashboard
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            <strong>ID:</strong> {currentTemplate.id}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DashboardSelector;