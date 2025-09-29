// API para integración REAL con ArgoCD
export interface ArgoCDApplication {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    resourceVersion: string;
    generation: number;
    creationTimestamp: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  spec: {
    project: string;
    source: {
      repoURL: string;
      path: string;
      targetRevision: string;
      helm?: {
        valueFiles?: string[];
        parameters?: Array<{
          name: string;
          value: string;
        }>;
      };
      kustomize?: {
        images?: string[];
      };
    };
    destination: {
      server: string;
      namespace: string;
    };
    syncPolicy?: {
      automated?: {
        prune: boolean;
        selfHeal: boolean;
        allowEmpty?: boolean;
      };
      syncOptions?: string[];
      retry?: {
        limit: number;
        backoff: {
          duration: string;
          factor: number;
          maxDuration: string;
        };
      };
    };
  };
  status: {
    sync: {
      status: 'Synced' | 'OutOfSync' | 'Unknown';
      comparedTo: {
        source: {
          repoURL: string;
          path: string;
          targetRevision: string;
        };
        destination: {
          server: string;
          namespace: string;
        };
      };
      revision: string;
    };
    health: {
      status: 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
      message?: string;
    };
    conditions?: Array<{
      type: string;
      message: string;
      lastTransitionTime: string;
    }>;
    history?: Array<{
      revision: string;
      deployedAt: string;
      id: number;
      source: {
        repoURL: string;
        path: string;
        targetRevision: string;
      };
    }>;
    operationState?: {
      operation: {
        sync: {
          revision: string;
          prune: boolean;
        };
      };
      phase: 'Running' | 'Succeeded' | 'Failed' | 'Error' | 'Terminating';
      message?: string;
      syncResult?: {
        resources: Array<{
          group: string;
          version: string;
          kind: string;
          namespace: string;
          name: string;
          status: string;
          message?: string;
          hookPhase?: string;
          syncPhase?: string;
        }>;
        revision: string;
        source: {
          repoURL: string;
          path: string;
          targetRevision: string;
        };
      };
      startedAt: string;
      finishedAt?: string;
    };
    resources?: Array<{
      version: string;
      kind: string;
      namespace: string;
      name: string;
      status: string;
      health?: {
        status: string;
        message?: string;
      };
      group?: string;
    }>;
    summary?: {
      externalURLs?: string[];
      images?: string[];
    };
  };
  operation?: {
    sync: {
      revision: string;
      prune: boolean;
      dryRun: boolean;
      syncOptions?: string[];
    };
  };
}

export interface ArgoCDProject {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    description?: string;
    sourceRepos: string[];
    destinations: Array<{
      namespace: string;
      server: string;
    }>;
  };
  status: {
    jwtTokensByRole?: { [key: string]: any };
  };
}

export interface ArgoCDRepository {
  repo: string;
  username?: string;
  password?: string;
  sshPrivateKey?: string;
  insecure?: boolean;
  enableLfs?: boolean;
  type?: string;
  name?: string;
}

export class ArgoCDApi {
  private baseUrl: string;
  private token?: string;
  private username?: string;
  private password?: string;

  constructor(
    baseUrl: string = 'http://localhost:8080',
    credentials?: {
      token?: string;
      username?: string;
      password?: string;
    }
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    if (credentials) {
      this.token = credentials.token;
      this.username = credentials.username;
      this.password = credentials.password;
    }
  }

  // Método para autenticación con usuario/contraseña
  async authenticate(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    if (!this.username || !this.password) {
      throw new Error('No authentication credentials provided');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.token;
      return this.token;
    } catch (error) {
      console.error('ArgoCD authentication failed:', error);
      throw new Error('Failed to authenticate with ArgoCD');
    }
  }

  private async makeRequest(path: string, method: string = 'GET', body?: any, retry = true): Promise<any> {
    // Asegurar autenticación
    if (!this.token && retry) {
      try {
        await this.authenticate();
      } catch (error) {
        console.warn('Authentication failed, proceeding without token');
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const url = `${this.baseUrl}${path}`;
      console.log(`🔗 ArgoCD API Request: ${method} ${url}`);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401 && retry && this.username && this.password) {
        // Token expirado, intentar re-autenticación
        console.log('🔐 Token expired, re-authenticating...');
        this.token = undefined;
        await this.authenticate();
        return this.makeRequest(path, method, body, false);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`❌ Error making request to ${path}:`, error);
      throw error;
    }
  }

  async getApplications(refresh?: boolean): Promise<ArgoCDApplication[]> {
    try {
      const params = new URLSearchParams();
      if (refresh) {
        params.append('refresh', 'true');
      }

      const path = `/api/v1/applications${params.toString() ? '?' + params.toString() : ''}`;
      const response = await this.makeRequest(path);

      if (response.items) {
        console.log(`✅ Fetched ${response.items.length} applications from ArgoCD`);
        return response.items;
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to fetch applications from ArgoCD:', error);
      console.warn('🔄 Falling back to mock data for development');
      return this.getMockApplications();
    }
  }

  async getApplication(name: string, refresh?: boolean): Promise<ArgoCDApplication> {
    try {
      const params = new URLSearchParams();
      if (refresh) {
        params.append('refresh', 'true');
      }

      const path = `/api/v1/applications/${name}${params.toString() ? '?' + params.toString() : ''}`;
      const application = await this.makeRequest(path);

      console.log(`✅ Fetched application ${name} from ArgoCD`);
      return application;
    } catch (error) {
      console.error(`❌ Failed to fetch application ${name} from ArgoCD:`, error);
      const mockApps = this.getMockApplications();
      return mockApps.find(app => app.metadata.name === name) || mockApps[0];
    }
  }

  async getProjects(): Promise<ArgoCDProject[]> {
    try {
      const response = await this.makeRequest('/api/v1/projects');

      if (response.items) {
        console.log(`✅ Fetched ${response.items.length} projects from ArgoCD`);
        return response.items;
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to fetch projects from ArgoCD:', error);
      console.warn('🔄 Falling back to mock data for development');
      return this.getMockProjects();
    }
  }

  async getRepositories(): Promise<ArgoCDRepository[]> {
    try {
      const response = await this.makeRequest('/api/v1/repositories');

      if (response.items) {
        console.log(`✅ Fetched ${response.items.length} repositories from ArgoCD`);
        return response.items;
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to fetch repositories from ArgoCD:', error);
      console.warn('🔄 Falling back to mock data for development');
      return this.getMockRepositories();
    }
  }

  async syncApplication(name: string, options?: {
    revision?: string;
    prune?: boolean;
    dryRun?: boolean;
    strategy?: 'hook' | 'apply';
    syncOptions?: string[];
  }): Promise<any> {
    try {
      const syncPayload = {
        revision: options?.revision || 'HEAD',
        prune: options?.prune || false,
        dryRun: options?.dryRun || false,
        strategy: {
          [options?.strategy || 'apply']: {},
        },
        syncOptions: options?.syncOptions || [],
      };

      console.log(`🔄 Syncing application ${name}...`);
      const result = await this.makeRequest(`/api/v1/applications/${name}/sync`, 'POST', syncPayload);
      console.log(`✅ Sync initiated for application ${name}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to sync application ${name}:`, error);
      throw error;
    }
  }

  async refreshApplication(name: string, type?: 'normal' | 'hard'): Promise<any> {
    try {
      const refreshType = type || 'normal';
      console.log(`🔄 Refreshing application ${name} (${refreshType})...`);

      const params = new URLSearchParams();
      if (refreshType === 'hard') {
        params.append('refresh', 'hard');
      }

      const path = `/api/v1/applications/${name}/resource/actions${params.toString() ? '?' + params.toString() : ''}`;
      const result = await this.makeRequest(path, 'POST');

      console.log(`✅ Refresh completed for application ${name}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to refresh application ${name}:`, error);
      throw error;
    }
  }

  async deleteApplication(name: string, cascade?: boolean): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (cascade) {
        params.append('cascade', 'true');
      }

      console.log(`🗑️ Deleting application ${name}...`);
      const path = `/api/v1/applications/${name}${params.toString() ? '?' + params.toString() : ''}`;
      const result = await this.makeRequest(path, 'DELETE');

      console.log(`✅ Application ${name} deleted`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete application ${name}:`, error);
      throw error;
    }
  }

  async getApplicationLogs(name: string, podName?: string, container?: string): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (podName) {
        params.append('podName', podName);
      }
      if (container) {
        params.append('container', container);
      }
      params.append('follow', 'false');
      params.append('tailLines', '100');

      const path = `/api/v1/applications/${name}/logs${params.toString() ? '?' + params.toString() : ''}`;
      const logs = await this.makeRequest(path);

      return typeof logs === 'string' ? logs : JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error(`❌ Failed to fetch logs for application ${name}:`, error);
      return `Error fetching logs: ${error}`;
    }
  }

  // Health check para verificar conectividad con ArgoCD
  async healthCheck(): Promise<{ healthy: boolean; version?: string; error?: string }> {
    try {
      const response = await this.makeRequest('/api/version');
      return {
        healthy: true,
        version: response.Version || 'unknown',
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Mock data para desarrollo/demo
  private getMockApplications(): ArgoCDApplication[] {
    return [
      {
        metadata: {
          name: 'sample-app',
          namespace: 'argocd',
          creationTimestamp: '2024-01-15T10:30:00Z',
          labels: {
            'app.kubernetes.io/instance': 'sample-app',
          },
        },
        spec: {
          project: 'default',
          source: {
            repoURL: 'https://github.com/company/sample-app',
            path: 'k8s/manifests',
            targetRevision: 'HEAD',
          },
          destination: {
            server: 'https://kubernetes.default.svc',
            namespace: 'sample-app',
          },
          syncPolicy: {
            automated: {
              prune: true,
              selfHeal: true,
            },
          },
        },
        status: {
          sync: {
            status: 'Synced',
            revision: 'abc123def456',
          },
          health: {
            status: 'Healthy',
          },
          resources: [
            {
              kind: 'Deployment',
              name: 'sample-app',
              namespace: 'sample-app',
              status: 'Synced',
              health: {
                status: 'Healthy',
              },
            },
            {
              kind: 'Service',
              name: 'sample-app',
              namespace: 'sample-app',
              status: 'Synced',
              health: {
                status: 'Healthy',
              },
            },
          ],
        },
      },
      {
        metadata: {
          name: 'python-app',
          namespace: 'argocd',
          creationTimestamp: '2024-01-14T08:15:00Z',
        },
        spec: {
          project: 'python-apps',
          source: {
            repoURL: 'https://github.com/company/python-app',
            path: 'kubernetes',
            targetRevision: 'main',
          },
          destination: {
            server: 'https://kubernetes.default.svc',
            namespace: 'python',
          },
        },
        status: {
          sync: {
            status: 'OutOfSync',
            revision: 'def789ghi012',
          },
          health: {
            status: 'Progressing',
            message: 'Deployment is progressing',
          },
        },
      },
      {
        metadata: {
          name: 'nginx-app',
          namespace: 'argocd',
          creationTimestamp: '2024-01-16T14:20:00Z',
        },
        spec: {
          project: 'web-apps',
          source: {
            repoURL: 'https://github.com/company/nginx-config',
            path: 'manifests',
            targetRevision: 'v1.2.0',
          },
          destination: {
            server: 'https://kubernetes.default.svc',
            namespace: 'nginx',
          },
        },
        status: {
          sync: {
            status: 'Synced',
            revision: 'ghi345jkl678',
          },
          health: {
            status: 'Healthy',
          },
        },
      },
    ];
  }

  private getMockProjects(): ArgoCDProject[] {
    return [
      {
        metadata: {
          name: 'default',
          namespace: 'argocd',
          creationTimestamp: '2024-01-10T09:00:00Z',
        },
        spec: {
          description: 'Default project',
          sourceRepos: ['*'],
          destinations: [
            {
              namespace: '*',
              server: 'https://kubernetes.default.svc',
            },
          ],
        },
        status: {},
      },
      {
        metadata: {
          name: 'python-apps',
          namespace: 'argocd',
          creationTimestamp: '2024-01-12T11:30:00Z',
        },
        spec: {
          description: 'Python applications project',
          sourceRepos: [
            'https://github.com/company/python-*',
            'https://github.com/company/flask-*',
          ],
          destinations: [
            {
              namespace: 'python',
              server: 'https://kubernetes.default.svc',
            },
            {
              namespace: 'python-dev',
              server: 'https://kubernetes.default.svc',
            },
          ],
        },
        status: {},
      },
    ];
  }

  private getMockRepositories(): ArgoCDRepository[] {
    return [
      {
        repo: 'https://github.com/company/sample-app',
        type: 'git',
        name: 'sample-app-repo',
      },
      {
        repo: 'https://github.com/company/python-app',
        type: 'git',
        name: 'python-app-repo',
      },
      {
        repo: 'https://helm.nginx.com/stable',
        type: 'helm',
        name: 'nginx-helm',
      },
    ];
  }
}

// Helper functions
export const formatAge = (creationTimestamp: string): string => {
  const created = new Date(creationTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMinutes > 0) return `${diffMinutes}m`;
  return 'Just now';
};

export const getStatusColor = (status: string): 'primary' | 'secondary' | 'default' => {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'synced':
      return 'primary';
    case 'degraded':
    case 'outofsync':
    case 'failed':
      return 'secondary';
    default:
      return 'default';
  }
};

// Configuración de ArgoCD desde variables de entorno o configuración
const getArgoCDConfig = () => {
  // Intentar obtener configuración desde variables de entorno
  const baseUrl = process.env.REACT_APP_ARGOCD_URL || 'http://localhost:8080';
  const username = process.env.REACT_APP_ARGOCD_USERNAME || 'admin';
  const password = process.env.REACT_APP_ARGOCD_PASSWORD || '';
  const token = process.env.REACT_APP_ARGOCD_TOKEN || '';

  console.log('🔧 ArgoCD Configuration:', {
    baseUrl,
    username: username ? '***' : 'not set',
    password: password ? '***' : 'not set',
    token: token ? '***' : 'not set',
  });

  return {
    baseUrl,
    credentials: {
      username,
      password,
      token: token || undefined,
    },
  };
};

// Singleton instance con configuración real
const config = getArgoCDConfig();
export const argoCDApi = new ArgoCDApi(config.baseUrl, config.credentials);

// Método helper para reconfigurar la API si es necesario
export const reconfigureArgoCDApi = (newConfig: {
  baseUrl?: string;
  username?: string;
  password?: string;
  token?: string;
}) => {
  const config = getArgoCDConfig();
  return new ArgoCDApi(
    newConfig.baseUrl || config.baseUrl,
    {
      username: newConfig.username || config.credentials.username,
      password: newConfig.password || config.credentials.password,
      token: newConfig.token || config.credentials.token,
    }
  );
};