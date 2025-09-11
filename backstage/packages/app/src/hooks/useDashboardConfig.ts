import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configPath: string;
  icon?: string;
  target: 'devops' | 'platform' | 'security' | 'management' | 'developer';
}

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
  availableTemplates: DashboardTemplate[];
  currentTemplate: DashboardTemplate | null;
  switchTemplate: (templateId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// Dashboard templates configuration
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/Portfolio-jaime/backstage-dashboard-templates/main';
const REGISTRY_URL = `${GITHUB_BASE_URL}/registry.yaml`;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SELECTED_DASHBOARD_KEY = 'backstage-selected-dashboard';

// Minimal fallback if registry.yaml completely fails
const EMERGENCY_FALLBACK_TEMPLATE: DashboardTemplate = {
  id: 'ba-devops',
  name: 'BA DevOps Dashboard',
  description: 'Operations monitoring and deployment status',
  category: 'Operations',
  configPath: 'templates/ba-devops-dashboard/config.yaml',
  icon: '🚀',
  target: 'devops'
};

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
    
    // Helper function to check if a widget is enabled
    const isWidgetEnabled = (widgetName: string): boolean => {
      const widgetSection = yamlContent.split(`${widgetName}:`)[1];
      if (!widgetSection) return false;
      
      const enabledMatch = widgetSection.match(/enabled:\s*(true|false)/);
      return enabledMatch && enabledMatch[1] === 'true';
    };
    
    // Check for GitHub widget
    if (isWidgetEnabled('github')) {
      enabledWidgets.github = { enabled: true, refreshInterval: 300000, maxEvents: 8 };
    }
    
    // Check for catalog widget  
    if (isWidgetEnabled('catalog')) {
      enabledWidgets.catalog = { enabled: true, refreshInterval: 120000, maxServices: 8 };
    }
    
    // Check for other widgets
    const widgetTypes = ['flightOps', 'costDashboard', 'security', 'systemHealth'];
    widgetTypes.forEach(widget => {
      if (isWidgetEnabled(widget)) {
        enabledWidgets[widget] = { enabled: true };
      }
    });
    
    // Special handling for worldClock with timezones
    if (isWidgetEnabled('worldClock')) {
      // Extract timezones from YAML
      const timezones = [];
      const timezoneMatches = yamlContent.match(/- name: "([^"]+)"\s+timezone: "([^"]+)"\s+flag: "([^"]+)"/g);
      if (timezoneMatches) {
        timezoneMatches.forEach(match => {
          const nameMatch = match.match(/name: "([^"]+)"/);
          const tzMatch = match.match(/timezone: "([^"]+)"/);
          const flagMatch = match.match(/flag: "([^"]+)"/);
          if (nameMatch && tzMatch && flagMatch) {
            timezones.push({
              name: nameMatch[1],
              timezone: tzMatch[1],
              flag: flagMatch[1]
            });
          }
        });
      }
      enabledWidgets.worldClock = { 
        enabled: true, 
        refreshInterval: 1000,
        timezones: timezones 
      };
    }
    
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
  const [availableTemplates, setAvailableTemplates] = useState<DashboardTemplate[]>([EMERGENCY_FALLBACK_TEMPLATE]);
  const [currentTemplate, setCurrentTemplate] = useState<DashboardTemplate | null>(null);


  // Parse registry YAML content
  const parseRegistryYaml = (yamlContent: string): DashboardTemplate[] => {
    try {
      const templates: DashboardTemplate[] = [];
      
      // Extract templates section using regex
      const templatesMatch = yamlContent.match(/templates:([\s\S]*?)(?=\n\w+:|$)/);
      if (!templatesMatch) {
        console.warn('⚠️  No templates section found in registry');
        return [EMERGENCY_FALLBACK_TEMPLATE];
      }

      // Parse each template entry
      const templateBlocks = templatesMatch[1].split(/\n\s*-\s+id:/);
      
      templateBlocks.forEach((block, index) => {
        if (index === 0 && !block.trim().startsWith('id:')) return; // Skip first empty block
        
        const templateText = index === 0 ? block : `id:${block}`;
        
        // Extract template properties
        const idMatch = templateText.match(/id:\s*([^\n]+)/);
        const nameMatch = templateText.match(/name:\s*([^\n]+)/);
        const descMatch = templateText.match(/description:\s*([^\n]+)/);
        const categoryMatch = templateText.match(/category:\s*([^\n]+)/);
        const configPathMatch = templateText.match(/configPath:\s*([^\n]+)/);
        const iconMatch = templateText.match(/icon:\s*["']([^"']+)["']/);
        const targetMatch = templateText.match(/target:\s*([^\n]+)/);

        if (idMatch && nameMatch && descMatch && configPathMatch && targetMatch) {
          templates.push({
            id: idMatch[1].trim(),
            name: nameMatch[1].trim().replace(/^["']|["']$/g, ''),
            description: descMatch[1].trim().replace(/^["']|["']$/g, ''),
            category: categoryMatch ? categoryMatch[1].trim() : 'General',
            configPath: configPathMatch[1].trim(),
            icon: iconMatch ? iconMatch[1] : '📊',
            target: targetMatch[1].trim() as any
          });
        }
      });

      console.log(`✅ Parsed ${templates.length} templates from registry`);
      return templates.length > 0 ? templates : [EMERGENCY_FALLBACK_TEMPLATE];
    } catch (error) {
      console.error('❌ Error parsing registry YAML:', error);
      return [EMERGENCY_FALLBACK_TEMPLATE];
    }
  };

  // Fetch available templates from registry
  const fetchTemplates = async (): Promise<DashboardTemplate[]> => {
    try {
      console.log('📋 Fetching dashboard registry from GitHub...');
      const response = await fetch(REGISTRY_URL);
      
      if (response.ok) {
        const registryContent = await response.text();
        console.log('📋 Registry loaded from GitHub, parsing...');
        console.log('📄 Registry content preview:', registryContent.substring(0, 200) + '...');
        
        const templates = parseRegistryYaml(registryContent);
        console.log('📋 Available templates:', templates.map(t => t.name));
        return templates;
      } else {
        console.warn('⚠️  Registry fetch failed:', response.status, response.statusText);
      }
    } catch (err) {
      console.warn('⚠️  Registry not accessible:', err);
    }
    
    console.log('🔄 Using emergency fallback template');
    return [EMERGENCY_FALLBACK_TEMPLATE];
  };

  // Fetch config for specific template
  const fetchConfigForTemplate = async (template: DashboardTemplate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const configUrl = `${GITHUB_BASE_URL}/${template.configPath}`;
      console.log('🔄 Fetching dashboard configuration...');
      console.log('📡 Template:', template.name);
      console.log('📡 URL:', configUrl);
      
      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'text/plain',
        },
      });
      
      console.log('📥 GitHub response status:', response.status, response.statusText);
      
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
      setCurrentTemplate(template);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching dashboard config:', errorMessage);
      console.error('🔧 Error details:', err);
      setError(`Failed to load template "${template.name}": ${errorMessage}`);
      
      // Use minimal fallback configuration
      console.log('🔄 Using minimal fallback configuration');
      console.log('🎛️  Fallback widgets:', Object.keys(MINIMAL_FALLBACK.spec.widgets));
      setConfig(MINIMAL_FALLBACK);
      setCurrentTemplate(template);
    } finally {
      setLoading(false);
    }
  };

  // Switch to different template
  const switchTemplate = async (templateId: string): Promise<void> => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) {
      console.error('❌ Template not found:', templateId);
      return;
    }

    localStorage.setItem(SELECTED_DASHBOARD_KEY, templateId);
    await fetchConfigForTemplate(template);
  };

  // Initialize
  useEffect(() => {
    const initializeDashboard = async () => {
      // Load available templates
      const templates = await fetchTemplates();
      setAvailableTemplates(templates);

      // Load selected dashboard - fix: use templates directly instead of availableTemplates
      const storedId = localStorage.getItem(SELECTED_DASHBOARD_KEY);
      let selectedTemplate;
      
      if (storedId) {
        selectedTemplate = templates.find(t => t.id === storedId);
      }
      
      // If no stored selection or stored template not found, default to ba-main
      if (!selectedTemplate) {
        selectedTemplate = templates.find(t => t.id === 'ba-main') || templates[0];
      }
      
      console.log(`🎯 Loading dashboard: ${selectedTemplate.name} (${selectedTemplate.id})`);
      
      await fetchConfigForTemplate(selectedTemplate);
    };

    initializeDashboard();
    
    // Set up auto-refresh for current template
    const interval = setInterval(() => {
      if (currentTemplate) {
        fetchConfigForTemplate(currentTemplate);
      }
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return {
    config,
    loading,
    error,
    availableTemplates,
    currentTemplate,
    switchTemplate,
    refetch: () => currentTemplate ? fetchConfigForTemplate(currentTemplate) : Promise.resolve(),
  };
};

export default useDashboardConfig;