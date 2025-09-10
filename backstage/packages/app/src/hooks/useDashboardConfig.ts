import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

interface DashboardConfig {
  metadata: {
    name: string;
    title: string;
    subtitle: string;
    version: string;
  };
  spec: {
    widgets: {
      [key: string]: any;
    };
    layout: {
      grid: {
        columns: number;
        spacing: number;
      };
      positions: {
        [key: string]: any;
      };
    };
    theme: {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      cardElevation: number;
      borderRadius: number;
    };
    branding?: {
      companyName: string;
      companyLogo: string;
      motto: string;
    };
  };
}

interface UseDashboardConfigResult {
  config: DashboardConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Use Backstage proxy instead of direct GitHub fetch to avoid CORS
const PROXY_CONFIG_URL = '/api/dashboard-config/config.yaml';
const GITHUB_CONFIG_URL = 'https://raw.githubusercontent.com/Portfolio-jaime/backstage-dashboard-templates/main/templates/ba-devops-dashboard/config.yaml';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Minimal fallback configuration - only basic structure
const MINIMAL_FALLBACK: DashboardConfig = {
  metadata: {
    name: 'minimal-fallback',
    title: 'Dashboard Configuration Error',
    subtitle: 'Please check GitHub repository configuration',
    version: '1.0.0',
  },
  spec: {
    widgets: {
      catalog: { enabled: true, refreshInterval: 120000, maxServices: 3 },
      worldClock: { enabled: true, refreshInterval: 1000, timezones: [] },
    },
    layout: {
      grid: { columns: 12, spacing: 3 },
      positions: { search: { xs: 12 }, catalog: { xs: 12 } },
    },
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#ff9800',
      backgroundColor: '#f5f5f5',
      cardElevation: 2,
      borderRadius: 8,
    },
  },
};

// Enhanced YAML parser for configuration
const parseYamlConfig = (yamlContent: string): DashboardConfig => {
  try {
    console.log('YAML content received:', yamlContent.substring(0, 200) + '...');
    
    // Extract metadata from YAML
    const titleMatch = yamlContent.match(/title:\s*["']?([^"'\n]+)["']?/);
    const subtitleMatch = yamlContent.match(/subtitle:\s*["']?([^"'\n]+)["']?/);
    const versionMatch = yamlContent.match(/version:\s*["']?([^"'\n]+)["']?/);
    const nameMatch = yamlContent.match(/name:\s*([^\n]+)/);
    
    // Extract widget configurations
    const enabledWidgets: {[key: string]: any} = {};
    
    // Check for GitHub widget
    if (yamlContent.includes('github:') && yamlContent.includes('enabled: true')) {
      enabledWidgets.github = { enabled: true, refreshInterval: 300000, maxEvents: 8 };
    }
    
    // Check for catalog widget
    if (yamlContent.includes('catalog:') && yamlContent.includes('enabled: true')) {
      enabledWidgets.catalog = { enabled: true, refreshInterval: 120000, maxServices: 8 };
    }
    
    // Check for other widgets
    const widgetTypes = ['flightOps', 'costDashboard', 'security', 'systemHealth', 'worldClock'];
    widgetTypes.forEach(widget => {
      if (yamlContent.includes(`${widget}:`) && yamlContent.includes('enabled: true')) {
        enabledWidgets[widget] = { enabled: true };
      }
    });
    
    // Extract theme colors
    const primaryColorMatch = yamlContent.match(/primaryColor:\s*["']?([^"'\n]+)["']?/);
    const secondaryColorMatch = yamlContent.match(/secondaryColor:\s*["']?([^"'\n]+)["']?/);
    
    return {
      metadata: {
        name: nameMatch ? nameMatch[1].trim() : MINIMAL_FALLBACK.metadata.name,
        title: titleMatch ? titleMatch[1].trim() : MINIMAL_FALLBACK.metadata.title,
        subtitle: subtitleMatch ? subtitleMatch[1].trim() : MINIMAL_FALLBACK.metadata.subtitle,
        version: versionMatch ? versionMatch[1].trim() : MINIMAL_FALLBACK.metadata.version,
      },
      spec: {
        widgets: Object.keys(enabledWidgets).length > 0 ? enabledWidgets : MINIMAL_FALLBACK.spec.widgets,
        layout: MINIMAL_FALLBACK.spec.layout,
        theme: {
          primaryColor: primaryColorMatch ? primaryColorMatch[1].trim() : MINIMAL_FALLBACK.spec.theme.primaryColor,
          secondaryColor: secondaryColorMatch ? secondaryColorMatch[1].trim() : MINIMAL_FALLBACK.spec.theme.secondaryColor,
          backgroundColor: MINIMAL_FALLBACK.spec.theme.backgroundColor,
          cardElevation: MINIMAL_FALLBACK.spec.theme.cardElevation,
          borderRadius: MINIMAL_FALLBACK.spec.theme.borderRadius,
        },
      },
    };
  } catch (error) {
    console.error('Error parsing YAML config:', error);
    return MINIMAL_FALLBACK;
  }
};

export const useDashboardConfig = (): UseDashboardConfigResult => {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching dashboard configuration via Backstage proxy...');
      console.log('📡 Proxy URL:', PROXY_CONFIG_URL);
      console.log('📡 Original GitHub URL:', GITHUB_CONFIG_URL);
      
      const response = await fetch(PROXY_CONFIG_URL, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'text/plain',
        },
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
      }

      const yamlContent = await response.text();
      console.log('📄 YAML content length:', yamlContent.length);
      console.log('📄 YAML preview:', yamlContent.substring(0, 300));
      
      const parsedConfig = parseYamlConfig(yamlContent);
      
      console.log('✅ Dashboard configuration loaded successfully!');
      console.log('🏷️  Title:', parsedConfig.metadata.title);
      console.log('🎛️  Widgets enabled:', Object.keys(parsedConfig.spec.widgets).filter(w => parsedConfig.spec.widgets[w]?.enabled));
      
      setConfig(parsedConfig);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching dashboard config:', errorMessage);
      console.error('🔧 Error details:', err);
      setError(`Failed to load external config: ${errorMessage}`);
      
      // Use minimal fallback configuration
      console.log('🔄 Using minimal fallback configuration');
      console.log('🎛️  Fallback widgets:', Object.keys(MINIMAL_FALLBACK.spec.widgets));
      setConfig(MINIMAL_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    
    // Set up auto-refresh
    const interval = setInterval(fetchConfig, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
  };
};

export default useDashboardConfig;