import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  Tooltip,
  Avatar,
  Badge,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PaletteIcon from '@material-ui/icons/Palette';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { useDynamicTheme, CustomThemeConfig } from '../../hooks/useDynamicTheme';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: 'var(--theme-card, ' + theme.palette.background.paper + ')',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid var(--theme-border, ${theme.palette.divider})`,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
    height: 'fit-content',
    transition: 'all 0.3s ease',
  },
  themeCard: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  selectedTheme: {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
  },
  themePreview: {
    height: 60,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    position: 'relative',
    overflow: 'hidden',
  },
  colorSwatch: {
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  primaryColor: {
    flex: 0.4,
  },
  secondaryColor: {
    flex: 0.3,
  },
  backgroundColor: {
    flex: 0.3,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    width: 24,
    height: 24,
  },
  categoryChip: {
    fontSize: '0.7em',
    height: 20,
    marginBottom: theme.spacing(1),
  },
  darkModeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  filterSection: {
    marginBottom: theme.spacing(2),
  },
  previewSection: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
}));

interface ThemeSelectorProps {
  currentDashboard?: string;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentDashboard, 
  compact = false 
}) => {
  const classes = useStyles();
  const {
    currentTheme,
    availableThemes,
    changeTheme,
    getThemesForDashboard,
    isDarkMode,
    toggleDarkMode,
  } = useDynamicTheme();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Obtener temas filtrados
  const getFilteredThemes = (): CustomThemeConfig[] => {
    let themes = currentDashboard 
      ? getThemesForDashboard(currentDashboard)
      : availableThemes;

    if (categoryFilter !== 'all') {
      themes = themes.filter(theme => theme.category === categoryFilter);
    }

    // Filtrar por tipo (light/dark) según el modo actual
    themes = themes.filter(theme => theme.type === (isDarkMode ? 'dark' : 'light'));

    return themes;
  };

  // Obtener categorías disponibles
  const getAvailableCategories = (): string[] => {
    const themes = currentDashboard 
      ? getThemesForDashboard(currentDashboard)
      : availableThemes;
    
    const categories = Array.from(new Set(themes.map(theme => theme.category)));
    return categories;
  };

  // Obtener color de categoría
  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'default' => {
    switch (category) {
      case 'dashboard-specific': return 'primary';
      case 'seasonal': return 'secondary';
      case 'default': return 'default';
      default: return 'default';
    }
  };

  // Componente de vista previa del tema
  const ThemePreview: React.FC<{ theme: CustomThemeConfig }> = ({ theme }) => (
    <div className={classes.themePreview}>
      <div className={classes.colorSwatch}>
        <div 
          className={classes.primaryColor}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className={classes.secondaryColor}
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className={classes.backgroundColor}
          style={{ backgroundColor: theme.colors.background }}
        />
      </div>
      {currentTheme.id === theme.id && (
        <Avatar className={classes.selectedBadge}>
          <CheckIcon fontSize="small" />
        </Avatar>
      )}
    </div>
  );

  // Versión compacta - solo botón
  if (compact) {
    return (
      <Box className={classes.container}>
        <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>
          🎨 Theme Selector
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={toggleDarkMode} size="small">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<PaletteIcon />}
            onClick={() => setDialogOpen(true)}
            size="small"
            fullWidth
          >
            Change Theme
          </Button>
        </Box>

        <Box p={1} style={{ 
          backgroundColor: currentTheme.colors.background,
          borderRadius: 4,
          border: `1px solid ${currentTheme.colors.border}`
        }}>
          <Typography variant="body2" style={{ fontWeight: 500 }}>
            {currentTheme.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {currentTheme.description}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className={classes.container}>
        <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>
          🎨 Theme Selector
        </Typography>
        
        {/* Dark Mode Toggle */}
        <Box className={classes.darkModeToggle}>
          <Brightness7Icon />
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                color="primary"
              />
            }
            label=""
          />
          <Brightness4Icon />
        </Box>

        {/* Current Theme Display */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent style={{ padding: 12 }}>
            <ThemePreview theme={currentTheme} />
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              {currentTheme.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {currentTheme.description}
            </Typography>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PaletteIcon />}
          onClick={() => setDialogOpen(true)}
          fullWidth
        >
          Browse Themes
        </Button>
      </Box>

      {/* Theme Selection Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <PaletteIcon />
              <span>Choose Theme</span>
              {currentDashboard && (
                <Chip 
                  label={`For ${currentDashboard}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Filters */}
          <Box className={classes.filterSection}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as string)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {getAvailableCategories().map(category => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Mode:</Typography>
                  <Chip 
                    label={isDarkMode ? 'Dark' : 'Light'}
                    size="small"
                    color={isDarkMode ? 'secondary' : 'primary'}
                    icon={isDarkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                    onClick={toggleDarkMode}
                    clickable
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Theme Grid */}
          <Grid container spacing={2}>
            {getFilteredThemes().map((theme) => (
              <Grid item xs={12} sm={6} md={4} key={theme.id}>
                <Card 
                  className={`${classes.themeCard} ${
                    currentTheme.id === theme.id ? classes.selectedTheme : ''
                  }`}
                  onClick={() => changeTheme(theme.id)}
                >
                  <CardContent style={{ padding: 12 }}>
                    <Chip
                      label={theme.category.replace('-', ' ')}
                      size="small"
                      color={getCategoryColor(theme.category)}
                      variant="outlined"
                      className={classes.categoryChip}
                    />
                    
                    <ThemePreview theme={theme} />
                    
                    <Typography variant="body2" style={{ fontWeight: 500 }}>
                      {theme.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {theme.description}
                    </Typography>
                    
                    {theme.forDashboards && (
                      <Box mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          Optimized for: {theme.forDashboards.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Preview Section */}
          <Box 
            className={classes.previewSection}
            style={{
              backgroundColor: currentTheme.colors.background,
              border: `1px solid ${currentTheme.colors.border}`,
            }}
          >
            <Typography 
              variant="h6" 
              style={{ color: currentTheme.colors.text, marginBottom: 8 }}
            >
              Theme Preview
            </Typography>
            <Box 
              p={2} 
              style={{
                backgroundColor: currentTheme.colors.card,
                borderRadius: 4,
                border: `1px solid ${currentTheme.colors.border}`,
              }}
            >
              <Typography 
                variant="body2" 
                style={{ color: currentTheme.colors.text }}
              >
                This is how cards and text will look with the selected theme.
              </Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip 
                  label="Primary" 
                  style={{ 
                    backgroundColor: currentTheme.colors.primary, 
                    color: 'white' 
                  }} 
                  size="small"
                />
                <Chip 
                  label="Secondary" 
                  style={{ 
                    backgroundColor: currentTheme.colors.secondary, 
                    color: 'white' 
                  }} 
                  size="small"
                />
                {currentTheme.colors.accent && (
                  <Chip 
                    label="Accent" 
                    style={{ 
                      backgroundColor: currentTheme.colors.accent, 
                      color: 'white' 
                    }} 
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThemeSelector;