#!/usr/bin/env node

const https = require('https');
const yaml = require('js-yaml');

const CONFIG_URL = 'https://raw.githubusercontent.com/Portfolio-jaime/backstage-dashboard-templates/main/templates/ba-devops-dashboard/config.yaml';

console.log('🔍 Validating dashboard configuration...');

https.get(CONFIG_URL, (response) => {
  let data = '';
  
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    try {
      const config = yaml.load(data);
      
      // Basic validation
      if (!config.apiVersion) {
        throw new Error('Missing apiVersion');
      }
      
      if (config.apiVersion !== 'backstage.io/v1') {
        throw new Error(`Invalid apiVersion: ${config.apiVersion}`);
      }
      
      if (!config.kind || config.kind !== 'DashboardConfig') {
        throw new Error(`Invalid kind: ${config.kind}`);
      }
      
      if (!config.metadata || !config.metadata.name) {
        throw new Error('Missing metadata.name');
      }
      
      if (!config.spec || !config.spec.widgets) {
        throw new Error('Missing spec.widgets');
      }
      
      console.log('✅ Configuration validation passed!');
      console.log(`📋 Dashboard: ${config.metadata.title || config.metadata.name}`);
      console.log(`📦 Version: ${config.metadata.version || 'unknown'}`);
      
      const enabledWidgets = Object.keys(config.spec.widgets).filter(
        key => config.spec.widgets[key].enabled
      );
      console.log(`🎛️  Enabled widgets: ${enabledWidgets.join(', ')}`);
      
      if (config.spec.theme) {
        console.log(`🎨 Theme: ${config.spec.theme.primaryColor || 'default'}`);
      }
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Configuration validation failed:');
      console.error(error.message);
      process.exit(1);
    }
  });
  
}).on('error', (error) => {
  console.error('❌ Failed to fetch configuration:');
  console.error(error.message);
  process.exit(1);
});