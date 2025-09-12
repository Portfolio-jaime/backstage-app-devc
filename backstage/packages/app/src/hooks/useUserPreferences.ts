import { useState, useEffect, createContext, useContext } from 'react';

export interface UserPreferences {
  defaultDashboard: string;
  favoriteWidgets: string[];
  refreshIntervals: { [key: string]: number };
  themePreference: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showDebugInfo: boolean;
  autoRefresh: boolean;
  notifications: {
    enabled: boolean;
    types: string[];
  };
  widgetVisibility: { [key: string]: boolean };
  dashboardLayout: {
    gridSpacing: number;
    cardElevation: number;
  };
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDashboard: 'ba-main',
  favoriteWidgets: ['worldClock', 'github', 'catalog'],
  refreshIntervals: {
    github: 300000,      // 5 minutes
    catalog: 120000,     // 2 minutes
    systemHealth: 60000, // 1 minute
    worldClock: 1000,    // 1 second
    metrics: 600000,     // 10 minutes
  },
  themePreference: 'auto',
  compactMode: false,
  showDebugInfo: false,
  autoRefresh: true,
  notifications: {
    enabled: true,
    types: ['system', 'security', 'deployment'],
  },
  widgetVisibility: {
    worldClock: true,
    github: true,
    catalog: true,
    systemHealth: true,
    security: true,
    costDashboard: true,
    flightOps: false,
    metrics: true,
  },
  dashboardLayout: {
    gridSpacing: 3,
    cardElevation: 2,
  },
};

const STORAGE_KEY = 'backstage-user-preferences';

// Context for sharing preferences across components
export const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

export const useUserPreferences = (): UserPreferencesContextType => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedPrefs = JSON.parse(stored);
          
          // Merge with defaults to handle new preference keys
          const mergedPrefs = {
            ...DEFAULT_PREFERENCES,
            ...parsedPrefs,
            refreshIntervals: {
              ...DEFAULT_PREFERENCES.refreshIntervals,
              ...parsedPrefs.refreshIntervals,
            },
            notifications: {
              ...DEFAULT_PREFERENCES.notifications,
              ...parsedPrefs.notifications,
            },
            widgetVisibility: {
              ...DEFAULT_PREFERENCES.widgetVisibility,
              ...parsedPrefs.widgetVisibility,
            },
            dashboardLayout: {
              ...DEFAULT_PREFERENCES.dashboardLayout,
              ...parsedPrefs.dashboardLayout,
            },
          };
          
          console.log('👤 User preferences loaded:', mergedPrefs);
          setPreferences(mergedPrefs);
        } else {
          console.log('👤 Using default preferences');
        }
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    const savePreferences = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        console.log('💾 User preferences saved');
      } catch (error) {
        console.warn('Failed to save user preferences:', error);
      }
    };

    // Don't save on initial load
    if (JSON.stringify(preferences) !== JSON.stringify(DEFAULT_PREFERENCES)) {
      savePreferences();
    }
  }, [preferences]);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    console.log(`👤 Updating preference: ${key}`, value);
    
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    console.log('🔄 Resetting user preferences to defaults');
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportPreferences = (): string => {
    const exportData = {
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    console.log('📤 Exporting user preferences');
    return JSON.stringify(exportData, null, 2);
  };

  const importPreferences = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.preferences || !parsed.version) {
        throw new Error('Invalid preferences format');
      }
      
      // Validate that the imported data has the correct structure
      const importedPrefs = parsed.preferences;
      const validatedPrefs = {
        ...DEFAULT_PREFERENCES,
        ...importedPrefs,
        refreshIntervals: {
          ...DEFAULT_PREFERENCES.refreshIntervals,
          ...importedPrefs.refreshIntervals,
        },
        notifications: {
          ...DEFAULT_PREFERENCES.notifications,
          ...importedPrefs.notifications,
        },
        widgetVisibility: {
          ...DEFAULT_PREFERENCES.widgetVisibility,
          ...importedPrefs.widgetVisibility,
        },
        dashboardLayout: {
          ...DEFAULT_PREFERENCES.dashboardLayout,
          ...importedPrefs.dashboardLayout,
        },
      };
      
      console.log('📥 Importing user preferences:', validatedPrefs);
      setPreferences(validatedPrefs);
      
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };
};

// Hook to use preferences context
export const useUserPreferencesContext = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferencesContext must be used within UserPreferencesProvider');
  }
  return context;
};

// Helper hooks for specific preference types
export const useThemePreference = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    theme: preferences.themePreference,
    setTheme: (theme: 'light' | 'dark' | 'auto') => updatePreference('themePreference', theme),
  };
};

export const useWidgetVisibility = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    visibility: preferences.widgetVisibility,
    toggleWidget: (widgetKey: string) => {
      const newVisibility = {
        ...preferences.widgetVisibility,
        [widgetKey]: !preferences.widgetVisibility[widgetKey],
      };
      updatePreference('widgetVisibility', newVisibility);
    },
    setWidgetVisibility: (widgetKey: string, visible: boolean) => {
      const newVisibility = {
        ...preferences.widgetVisibility,
        [widgetKey]: visible,
      };
      updatePreference('widgetVisibility', newVisibility);
    },
  };
};

export const useRefreshIntervals = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    intervals: preferences.refreshIntervals,
    setInterval: (widgetKey: string, interval: number) => {
      const newIntervals = {
        ...preferences.refreshIntervals,
        [widgetKey]: interval,
      };
      updatePreference('refreshIntervals', newIntervals);
    },
  };
};

export default useUserPreferences;