import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { createTheme, Theme } from '@material-ui/core/styles';
import { PaletteType } from '@material-ui/core';

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

// Provider de temas dinámicos
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

  // Cargar tema guardado del localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('backstage-theme');
    const savedDarkMode = localStorage.getItem('backstage-dark-mode') === 'true';
    
    if (savedTheme && SYSTEM_THEMES.find(t => t.id === savedTheme)) {
      setCurrentThemeId(savedTheme);
    }
    setIsDarkMode(savedDarkMode);
  }, []);

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('backstage-theme', currentThemeId);
    localStorage.setItem('backstage-dark-mode', isDarkMode.toString());
  }, [currentThemeId, isDarkMode]);

  // Cambiar tema automáticamente según el dashboard (opcional)
  useEffect(() => {
    if (currentDashboard) {
      const dashboardTheme = SYSTEM_THEMES.find(theme => 
        theme.forDashboards?.includes(currentDashboard) && 
        theme.type === (isDarkMode ? 'dark' : 'light')
      );
      
      // Solo auto-cambiar si el usuario no ha seleccionado manualmente un tema personalizado
      const isDefaultTheme = currentThemeId.includes('ba-classic');
      if (dashboardTheme && isDefaultTheme) {
        setCurrentThemeId(dashboardTheme.id);
      }
    }
  }, [currentDashboard, isDarkMode]);

  // Obtener tema actual
  const currentTheme = SYSTEM_THEMES.find(t => t.id === currentThemeId) || SYSTEM_THEMES[0];

  // Crear tema de Material-UI basado en la configuración personalizada
  const materialTheme = createTheme({
    palette: {
      type: currentTheme.type as PaletteType,
      primary: {
        main: currentTheme.colors.primary,
      },
      secondary: {
        main: currentTheme.colors.secondary,
      },
      background: {
        default: currentTheme.colors.background,
        paper: currentTheme.colors.surface,
      },
      text: {
        primary: currentTheme.colors.text,
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
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
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
    },
  });

  // Función para cambiar tema
  const changeTheme = (themeId: string) => {
    if (SYSTEM_THEMES.find(t => t.id === themeId)) {
      setCurrentThemeId(themeId);
      console.log(`🎨 Theme changed to: ${themeId}`);
    }
  };

  // Obtener temas disponibles para un dashboard específico
  const getThemesForDashboard = (dashboardId: string): CustomThemeConfig[] => {
    return SYSTEM_THEMES.filter(theme => {
      // Incluir temas por defecto y temas específicos del dashboard
      return theme.category === 'default' || 
             theme.category === 'seasonal' ||
             theme.forDashboards?.includes(dashboardId);
    });
  };

  // Toggle entre modo claro y oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Cambiar al tema equivalente en el modo contrario
    const currentThemeBase = currentThemeId.replace('-light', '').replace('-dark', '');
    const newThemeId = `${currentThemeBase}-${newDarkMode ? 'dark' : 'light'}`;
    
    if (SYSTEM_THEMES.find(t => t.id === newThemeId)) {
      setCurrentThemeId(newThemeId);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    availableThemes: SYSTEM_THEMES,
    materialTheme,
    changeTheme,
    getThemesForDashboard,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useDynamicTheme;