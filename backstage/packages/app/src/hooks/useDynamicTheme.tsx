import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { createTheme, Theme, ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { PaletteType } from '@material-ui/core';
import { themes, lightTheme, darkTheme } from '@backstage/theme';
import { useDashboardConfig } from './useDashboardConfig';

// Definición de tipos para temas personalizados
export interface CustomThemeConfig {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    card: string;
    border: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  category: 'default' | 'dashboard-specific' | 'seasonal' | 'custom';
  forDashboards?: string[]; // Dashboards específicos para los que está optimizado
}

// Temas predefinidos del sistema
export const SYSTEM_THEMES: CustomThemeConfig[] = [
  // Temas BA Clásicos
  {
    id: 'ba-classic-light',
    name: 'BA Classic Light',
    description: 'Tema clásico de British Airways - Claro',
    type: 'light',
    colors: {
      primary: '#1e3a8a',    // BA Blue
      secondary: '#dc2626',   // BA Red
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      card: '#ffffff',
      border: '#e2e8f0',
      accent: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    category: 'default',
  },
  {
    id: 'ba-classic-dark',
    name: 'BA Classic Dark',
    description: 'Tema clásico de British Airways - Oscuro',
    type: 'dark',
    colors: {
      primary: '#3b82f6',    // Lighter BA Blue for dark
      secondary: '#ef4444',   // Lighter BA Red for dark
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      card: '#334155',
      border: '#475569',
      accent: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    category: 'default',
  },
  
  // Temas para DevOps Dashboard
  {
    id: 'devops-terminal',
    name: 'DevOps Terminal',
    description: 'Tema oscuro inspirado en terminales para DevOps',
    type: 'dark',
    colors: {
      primary: '#00d9ff',    // Cyan techie
      secondary: '#ff6b35',   // Orange accent
      background: '#0a0a0a',
      surface: '#1a1a2e',
      text: '#eee6e6',
      card: '#16213e',
      border: '#0f3460',
      accent: '#00ff88',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff3333',
    },
    category: 'dashboard-specific',
    forDashboards: ['ba-devops'],
  },
  {
    id: 'devops-matrix',
    name: 'DevOps Matrix',
    description: 'Tema verde matrix para operaciones DevOps',
    type: 'dark',
    colors: {
      primary: '#00ff41',    // Matrix green
      secondary: '#ff0080',   // Hot pink accent
      background: '#001100',
      surface: '#003300',
      text: '#00ff41',
      card: '#002200',
      border: '#004400',
      accent: '#00ccff',
      success: '#00ff41',
      warning: '#ffff00',
      error: '#ff0000',
    },
    category: 'dashboard-specific',
    forDashboards: ['ba-devops'],
  },
  
  // Temas para Security Dashboard
  {
    id: 'security-alert',
    name: 'Security Alert',
    description: 'Tema rojo para dashboard de seguridad',
    type: 'dark',
    colors: {
      primary: '#dc2626',    // Alert red
      secondary: '#f59e0b',   // Warning amber
      background: '#1a0a0a',
      surface: '#2d1b1b',
      text: '#fef2f2',
      card: '#3d2626',
      border: '#5d3737',
      accent: '#fbbf24',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    category: 'dashboard-specific',
    forDashboards: ['ba-security'],
  },
  
  // Temas para Platform Dashboard
  {
    id: 'platform-enterprise',
    name: 'Platform Enterprise',
    description: 'Tema corporativo verde para plataforma',
    type: 'light',
    colors: {
      primary: '#059669',    // Enterprise green
      secondary: '#0891b2',   // Teal accent
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#064e3b',
      card: '#ffffff',
      border: '#a7f3d0',
      accent: '#06b6d4',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    category: 'dashboard-specific',
    forDashboards: ['ba-platform'],
  },
  
  // Temas estacionales/especiales
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Tema azul nocturno elegante',
    type: 'dark',
    colors: {
      primary: '#1e40af',
      secondary: '#7c3aed',
      background: '#0c1427',
      surface: '#1e293b',
      text: '#e2e8f0',
      card: '#334155',
      border: '#475569',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    category: 'seasonal',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Tema cálido inspirado en el atardecer',
    type: 'light',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#92400e',
      card: '#fef3c7',
      border: '#fbbf24',
      accent: '#f59e0b',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    category: 'seasonal',
  },
];

// Contexto para manejo de temas
interface ThemeContextType {
  currentTheme: CustomThemeConfig;
  availableThemes: CustomThemeConfig[];
  materialTheme: Theme;
  changeTheme: (themeId: string) => void;
  getThemesForDashboard: (dashboardId: string) => CustomThemeConfig[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook para usar el contexto de temas
export const useDynamicTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDynamicTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider de temas dinámicos - simplificado para compatibilidad con Backstage
interface DynamicThemeProviderProps {
  children: ReactNode;
  currentDashboard?: string;
}

export const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({
  children,
  currentDashboard
}) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>('ba-classic-light');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [availableThemes, setAvailableThemes] = useState<CustomThemeConfig[]>(SYSTEM_THEMES);
  const [activeDashboard, setActiveDashboard] = useState<string>(currentDashboard || '');
  const { config } = useDashboardConfig();

  // Monitor dashboard changes from session storage
  useEffect(() => {
    const checkDashboardChange = () => {
      const dashboard = sessionStorage.getItem('current-dashboard');
      if (dashboard && dashboard !== activeDashboard) {
        setActiveDashboard(dashboard);
        console.log('📊 Dashboard changed to:', dashboard);
      }
    };

    checkDashboardChange();
    const interval = setInterval(checkDashboardChange, 1000);
    return () => clearInterval(interval);
  }, [activeDashboard]);

  // Cargar temas desde la configuración del dashboard
  useEffect(() => {
    if (config?.spec?.theme?.availableThemes) {
      const configThemes: CustomThemeConfig[] = config.spec.theme.availableThemes.map(theme => ({
        ...theme,
        colors: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          background: theme.colors.background,
          surface: theme.colors.surface,
          text: theme.colors.text,
          card: theme.colors.card,
          border: theme.colors.border,
          accent: theme.colors.accent,
          success: theme.colors.success,
          warning: theme.colors.warning,
          error: theme.colors.error,
        }
      }));

      // Combinar temas del sistema con temas de configuración
      setAvailableThemes([...SYSTEM_THEMES, ...configThemes]);
      console.log('🎨 Loaded themes from config:', configThemes.length);
    }
  }, [config]);

  // Auto-seleccionar tema basado en dashboard actual
  useEffect(() => {
    if (activeDashboard) {
      const savedTheme = localStorage.getItem(`backstage-theme-${activeDashboard}`);
      if (savedTheme && availableThemes.find(t => t.id === savedTheme)) {
        setCurrentThemeId(savedTheme);
        console.log(`🎨 Loaded saved theme for ${activeDashboard}: ${savedTheme}`);
        return;
      }

      // Auto-seleccionar tema por defecto para dashboard específico
      const dashboardSpecificThemes = availableThemes.filter(theme =>
        theme.forDashboards?.includes(activeDashboard) ||
        (theme.category === 'dashboard-specific' &&
         (activeDashboard.includes('devops') || activeDashboard === 'ba-devops'))
      );

      if (dashboardSpecificThemes.length > 0) {
        const defaultTheme = dashboardSpecificThemes[0];
        setCurrentThemeId(defaultTheme.id);
        setIsDarkMode(defaultTheme.type === 'dark');
        console.log(`🎨 Auto-selected theme for ${activeDashboard}: ${defaultTheme.id}`);
        return;
      }
    }

    // Fallback: cargar tema guardado globalmente
    const savedTheme = localStorage.getItem('backstage-custom-theme');
    const savedDarkMode = localStorage.getItem('backstage-custom-dark-mode') === 'true';

    if (savedTheme && availableThemes.find(t => t.id === savedTheme)) {
      setCurrentThemeId(savedTheme);
    }
    setIsDarkMode(savedDarkMode);
  }, [availableThemes, activeDashboard]);

  // Guardar preferencias en localStorage
  useEffect(() => {
    // Guardar tema específico por dashboard
    if (activeDashboard) {
      localStorage.setItem(`backstage-theme-${activeDashboard}`, currentThemeId);
    }
    // Guardar tema global como fallback
    localStorage.setItem('backstage-custom-theme', currentThemeId);
    localStorage.setItem('backstage-custom-dark-mode', isDarkMode.toString());
  }, [currentThemeId, isDarkMode, activeDashboard]);

  // Obtener tema actual
  const currentTheme = availableThemes.find(t => t.id === currentThemeId) || availableThemes[0];

  // Crear tema personalizado basado en los colores del tema actual
  const materialTheme = createTheme({
    ...(currentTheme.type === 'dark' ? darkTheme : lightTheme),
    palette: {
      ...(currentTheme.type === 'dark' ? darkTheme.palette : lightTheme.palette),
      type: currentTheme.type as PaletteType,
      primary: {
        main: currentTheme.colors.primary,
        contrastText: currentTheme.type === 'dark' ? '#ffffff' : '#000000',
      },
      secondary: {
        main: currentTheme.colors.secondary,
        contrastText: currentTheme.type === 'dark' ? '#ffffff' : '#000000',
      },
      background: {
        default: currentTheme.colors.background,
        paper: currentTheme.colors.card,
      },
      text: {
        primary: currentTheme.colors.text,
        secondary: currentTheme.type === 'dark' ?
          'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
      divider: currentTheme.colors.border,
      success: {
        main: currentTheme.colors.success || '#4caf50',
      },
      warning: {
        main: currentTheme.colors.warning || '#ff9800',
      },
      error: {
        main: currentTheme.colors.error || '#f44336',
      },
    },
    overrides: {
      MuiCard: {
        root: {
          backgroundColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.border,
        },
      },
      MuiPaper: {
        root: {
          backgroundColor: currentTheme.colors.surface,
        },
      },
      MuiAppBar: {
        root: {
          backgroundColor: currentTheme.colors.primary,
        },
      },
      MuiChip: {
        root: {
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
        },
      },
    },
  });

  // Función para cambiar tema
  const changeTheme = (themeId: string) => {
    if (availableThemes.find(t => t.id === themeId)) {
      setCurrentThemeId(themeId);
      console.log(`🎨 Theme changed to: ${themeId}`);
    }
  };

  // Obtener temas disponibles para un dashboard específico
  const getThemesForDashboard = (dashboardId: string): CustomThemeConfig[] => {
    return availableThemes.filter(theme => {
      return theme.category === 'default' ||
             theme.category === 'seasonal' ||
             theme.forDashboards?.includes(dashboardId) ||
             theme.category === 'dashboard-specific';
    });
  };

  // Toggle entre modo claro y oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    const currentThemeBase = currentThemeId.replace('-light', '').replace('-dark', '');
    const newThemeId = `${currentThemeBase}-${newDarkMode ? 'dark' : 'light'}`;

    if (availableThemes.find(t => t.id === newThemeId)) {
      setCurrentThemeId(newThemeId);
    }
  };

  // Aplicar CSS variables globales para el tema
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--theme-background', currentTheme.colors.background);
    root.style.setProperty('--theme-surface', currentTheme.colors.surface);
    root.style.setProperty('--theme-text', currentTheme.colors.text);
    root.style.setProperty('--theme-card', currentTheme.colors.card);
    root.style.setProperty('--theme-border', currentTheme.colors.border);
    root.style.setProperty('--theme-accent', currentTheme.colors.accent || currentTheme.colors.primary);
    root.style.setProperty('--theme-success', currentTheme.colors.success || '#4caf50');
    root.style.setProperty('--theme-warning', currentTheme.colors.warning || '#ff9800');
    root.style.setProperty('--theme-error', currentTheme.colors.error || '#f44336');

    console.log('🎨 CSS Variables updated for theme:', currentTheme.id);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    availableThemes,
    materialTheme,
    changeTheme,
    getThemesForDashboard,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={materialTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default DynamicThemeProvider;