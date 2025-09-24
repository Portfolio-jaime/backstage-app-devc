import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';
import { costInsightsApiRef } from '@backstage/plugin-cost-insights';

// Enhanced Cost Insights API implementation con datos más realistas
class SimpleCostInsightsApi {
  async getUserGroups() {
    return ['frontend-team', 'backend-team', 'devops-team', 'data-team'];
  }

  async getGroupProjects() {
    return {
      'frontend-team': ['web-portal', 'mobile-app', 'admin-dashboard'],
      'backend-team': ['api-gateway', 'user-service', 'payment-service'],
      'devops-team': ['monitoring', 'ci-cd-pipeline', 'infrastructure'],
      'data-team': ['data-warehouse', 'analytics-pipeline', 'ml-models']
    };
  }

  async getDailyMetricData(request) {
    const today = new Date();
    const data = [];

    // Generar datos de los últimos 30 días
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simular costos variables con patrones realistas
      const baseCost = Math.random() * 100 + 150; // Entre $150-250
      const weekdayMultiplier = date.getDay() >= 1 && date.getDay() <= 5 ? 1.2 : 0.8;
      const cost = baseCost * weekdayMultiplier;

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(cost * 100) / 100
      });
    }

    return data;
  }

  async getGroupDailyCost(request) {
    const group = request?.group || 'frontend-team';
    const baseCosts = {
      'frontend-team': 320,
      'backend-team': 450,
      'devops-team': 280,
      'data-team': 520
    };

    const baseCost = baseCosts[group] || 300;
    const variation = (Math.random() - 0.5) * 100; // Variación de ±$50
    const currentCost = baseCost + variation;

    return {
      aggregation: [currentCost - 50, currentCost - 25, currentCost],
      change: {
        ratio: variation > 0 ? Math.abs(variation) / baseCost : -Math.abs(variation) / baseCost,
        amount: Math.round(Math.abs(variation) * 100) / 100
      },
      trend: variation > 0 ? 'up' : 'down'
    };
  }

  async getProjectDailyCost(request) {
    const project = request?.project || 'web-portal';
    const projectCosts = {
      'web-portal': 120,
      'mobile-app': 95,
      'admin-dashboard': 85,
      'api-gateway': 180,
      'user-service': 140,
      'payment-service': 200,
      'monitoring': 110,
      'ci-cd-pipeline': 75,
      'infrastructure': 95,
      'data-warehouse': 250,
      'analytics-pipeline': 180,
      'ml-models': 220
    };

    const baseCost = projectCosts[project] || 100;
    const variation = (Math.random() - 0.5) * 40; // Variación de ±$20
    const currentCost = baseCost + variation;

    return {
      aggregation: [currentCost - 20, currentCost - 10, currentCost],
      change: {
        ratio: variation > 0 ? Math.abs(variation) / baseCost : -Math.abs(variation) / baseCost,
        amount: Math.round(Math.abs(variation) * 100) / 100
      },
      trend: variation > 0 ? 'up' : 'down'
    };
  }

  async getAlerts(request) {
    // Generar alertas realistas de ejemplo
    const alerts = [];

    if (Math.random() > 0.7) {
      alerts.push({
        id: 'high-compute-cost',
        title: 'Alto costo de compute detectado',
        subtitle: 'El equipo backend-team ha excedido el presupuesto mensual',
        message: 'Los costos de compute han aumentado un 35% esta semana debido al incremento de tráfico.',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        group: 'backend-team',
        project: 'api-gateway',
        status: 'warning'
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: 'storage-spike',
        title: 'Pico en costos de almacenamiento',
        subtitle: 'Incremento inesperado en data-warehouse',
        message: 'Los costos de almacenamiento han aumentado un 50% en las últimas 24 horas.',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
        group: 'data-team',
        project: 'data-warehouse',
        status: 'critical'
      });
    }

    return alerts;
  }

  async getProducts() {
    return [
      'Compute Engine',
      'Cloud Storage',
      'Cloud SQL',
      'Load Balancer',
      'CDN',
      'Monitoring'
    ];
  }

  async getLastCompleteDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  async getCostInsightsConfig() {
    return {
      engineerThreshold: 0.5,
      products: [
        { kind: 'compute-engine', name: 'Compute Engine' },
        { kind: 'cloud-storage', name: 'Cloud Storage' },
        { kind: 'cloud-sql', name: 'Cloud SQL' },
        { kind: 'load-balancer', name: 'Load Balancer' },
        { kind: 'cdn', name: 'CDN' },
        { kind: 'monitoring', name: 'Monitoring' }
      ],
      metrics: [
        { kind: 'cost', name: 'Cost', default: true },
        { kind: 'usage', name: 'Usage', default: false }
      ],
      currencies: [
        { kind: 'USD', label: 'US Dollars', unit: 'Dollar' },
        { kind: 'EUR', label: 'Euros', unit: 'Euro' }
      ]
    };
  }

  async getProjectGrowthData(project) {
    const data = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);

      data.push({
        date: date.toISOString().split('T')[0].substring(0, 7), // YYYY-MM format
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: {
          ratio: (Math.random() - 0.5) * 0.4, // -20% to +20%
          amount: Math.random() * 100
        },
        aggregation: [Math.random() * 500 + 200]
      });
    }

    return data;
  }

  async getGroupGrowthData(group) {
    const data = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);

      data.push({
        date: date.toISOString().split('T')[0].substring(0, 7),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: {
          ratio: (Math.random() - 0.5) * 0.3,
          amount: Math.random() * 200
        },
        aggregation: [Math.random() * 1000 + 400]
      });
    }

    return data;
  }
}

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  createApiFactory({
    api: costInsightsApiRef,
    deps: {},
    factory: () => new SimpleCostInsightsApi(),
  }),
  ScmAuth.createDefaultApiFactory(),
];
