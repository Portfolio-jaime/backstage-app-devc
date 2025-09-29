// API para conexión directa con Kubernetes cluster

export interface KubernetesClusterInfo {
  name: string;
  authProvider: string;
  url: string;
  skipTLSVerify?: boolean;
  skipMetricsLookup?: boolean;
}

export interface PodStatus {
  name: string;
  namespace: string;
  status: {
    phase: string;
    conditions?: Array<{
      type: string;
      status: string;
      lastTransitionTime: string;
    }>;
  };
  spec: {
    nodeName?: string;
    containers: Array<{
      name: string;
      image: string;
      resources?: {
        requests?: { [key: string]: string };
        limits?: { [key: string]: string };
      };
    }>;
  };
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
}

export interface ServiceStatus {
  name: string;
  namespace: string;
  spec: {
    type: string;
    clusterIP: string;
    ports: Array<{
      port: number;
      targetPort: number | string;
      protocol: string;
      name?: string;
    }>;
    selector?: { [key: string]: string };
  };
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
}

export interface DeploymentStatus {
  name: string;
  namespace: string;
  status: {
    replicas?: number;
    readyReplicas?: number;
    updatedReplicas?: number;
    availableReplicas?: number;
  };
  spec: {
    replicas: number;
    selector: {
      matchLabels: { [key: string]: string };
    };
  };
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
}

export interface NodeStatus {
  name: string;
  status: {
    conditions: Array<{
      type: string;
      status: string;
      lastHeartbeatTime: string;
    }>;
    nodeInfo: {
      kubeletVersion: string;
      osImage: string;
      architecture: string;
    };
  };
  metadata: {
    name: string;
    labels?: { [key: string]: string };
    creationTimestamp: string;
  };
}

export interface PodMetrics {
  name: string;
  namespace: string;
  containers: Array<{
    name: string;
    usage: {
      cpu: string;
      memory: string;
    };
  }>;
}

export interface NodeMetrics {
  name: string;
  usage: {
    cpu: string;
    memory: string;
  };
}

export class LiveKubernetesApi {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = 'http://localhost:8001', token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async makeRequest(path: string): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log(`🔍 Attempting to fetch: ${this.baseUrl}${path}`);

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers,
        method: 'GET',
        mode: 'cors', // Enable CORS
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched data from: ${path}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${path}:`, error);
      throw error;
    }
  }

  async getPods(namespace?: string): Promise<PodStatus[]> {
    const path = namespace
      ? `/api/v1/namespaces/${namespace}/pods`
      : '/api/v1/pods';

    const response = await this.makeRequest(path);
    return response.items || [];
  }

  async getServices(namespace?: string): Promise<ServiceStatus[]> {
    const path = namespace
      ? `/api/v1/namespaces/${namespace}/services`
      : '/api/v1/services';

    const response = await this.makeRequest(path);
    return response.items || [];
  }

  async getDeployments(namespace?: string): Promise<DeploymentStatus[]> {
    const path = namespace
      ? `/apis/apps/v1/namespaces/${namespace}/deployments`
      : '/apis/apps/v1/deployments';

    const response = await this.makeRequest(path);
    return response.items || [];
  }

  async getNodes(): Promise<NodeStatus[]> {
    const response = await this.makeRequest('/api/v1/nodes');
    return response.items || [];
  }

  async getNamespaces(): Promise<string[]> {
    const response = await this.makeRequest('/api/v1/namespaces');
    return response.items?.map((ns: any) => ns.metadata.name) || [];
  }

  async getPodMetrics(namespace?: string): Promise<PodMetrics[]> {
    try {
      const path = namespace
        ? `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods`
        : '/apis/metrics.k8s.io/v1beta1/pods';

      const response = await this.makeRequest(path);
      return response.items || [];
    } catch (error) {
      console.warn('Metrics server not available, returning empty metrics');
      return [];
    }
  }

  async getNodeMetrics(): Promise<NodeMetrics[]> {
    try {
      const response = await this.makeRequest('/apis/metrics.k8s.io/v1beta1/nodes');
      return response.items || [];
    } catch (error) {
      console.warn('Metrics server not available, returning empty metrics');
      return [];
    }
  }

  async getPodLogs(namespace: string, podName: string, containerName?: string): Promise<string> {
    let path = `/api/v1/namespaces/${namespace}/pods/${podName}/log?tailLines=100`;

    if (containerName) {
      path += `&container=${containerName}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching logs for ${podName}:`, error);
      return 'Error fetching logs';
    }
  }

  // Get resource quotas and limits
  async getResourceQuotas(namespace?: string): Promise<any[]> {
    try {
      const path = namespace
        ? `/api/v1/namespaces/${namespace}/resourcequotas`
        : '/api/v1/resourcequotas';

      const response = await this.makeRequest(path);
      return response.items || [];
    } catch (error) {
      console.warn('ResourceQuotas not available:', error);
      return [];
    }
  }

  // Get limit ranges
  async getLimitRanges(namespace?: string): Promise<any[]> {
    try {
      const path = namespace
        ? `/api/v1/namespaces/${namespace}/limitranges`
        : '/api/v1/limitranges';

      const response = await this.makeRequest(path);
      return response.items || [];
    } catch (error) {
      console.warn('LimitRanges not available:', error);
      return [];
    }
  }

  // Get persistent volumes
  async getPersistentVolumes(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/api/v1/persistentvolumes');
      return response.items || [];
    } catch (error) {
      console.warn('PersistentVolumes not available:', error);
      return [];
    }
  }

  // Get ingresses
  async getIngresses(namespace?: string): Promise<any[]> {
    try {
      const path = namespace
        ? `/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`
        : '/apis/networking.k8s.io/v1/ingresses';

      const response = await this.makeRequest(path);
      return response.items || [];
    } catch (error) {
      console.warn('Ingresses not available:', error);
      return [];
    }
  }

  // Health check para verificar conectividad
  async healthCheck(): Promise<{ healthy: boolean; version?: string; error?: string }> {
    try {
      const response = await this.makeRequest('/version');
      return {
        healthy: true,
        version: `${response.major}.${response.minor}`,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Helper functions para formateo de datos
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

export const formatCpu = (cpuString: string): string => {
  if (cpuString.endsWith('n')) {
    const value = parseInt(cpuString.slice(0, -1));
    return `${Math.round(value / 1000000)}m`;
  }
  if (cpuString.endsWith('m')) {
    return cpuString;
  }
  const value = parseFloat(cpuString);
  return `${Math.round(value * 1000)}m`;
};

export const formatMemory = (memoryString: string): string => {
  if (memoryString.endsWith('Ki')) {
    const value = parseInt(memoryString.slice(0, -2));
    return `${Math.round(value / 1024)}Mi`;
  }
  if (memoryString.endsWith('Mi')) {
    return memoryString;
  }
  if (memoryString.endsWith('Gi')) {
    const value = parseFloat(memoryString.slice(0, -2));
    return `${Math.round(value * 1024)}Mi`;
  }
  // Assume bytes
  const value = parseInt(memoryString);
  return `${Math.round(value / 1024 / 1024)}Mi`;
};

// Singleton instance with environment configuration
const kubernetesUrl = process.env.REACT_APP_KUBERNETES_URL || 'http://localhost:8001';
const kubernetesToken = process.env.REACT_APP_KUBERNETES_TOKEN;

export const kubernetesApi = new LiveKubernetesApi(kubernetesUrl, kubernetesToken);