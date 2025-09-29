import { useState, useEffect, useCallback } from 'react';
import {
  kubernetesApi,
  PodStatus,
  ServiceStatus,
  DeploymentStatus,
  NodeStatus,
  PodMetrics,
  NodeMetrics,
  formatAge,
  formatCpu,
  formatMemory,
} from '../api/kubernetesApi';

export interface ProcessedPodMetrics {
  name: string;
  namespace: string;
  status: string;
  cpuUsage: string;
  memoryUsage: string;
  restarts: number;
  node: string;
  ready: string;
  age: string;
  labels?: { [key: string]: string };
  image: string;
}

export interface ProcessedServiceInfo {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  ports: string;
  age: string;
}

export interface ProcessedDeploymentInfo {
  name: string;
  namespace: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
}

export interface ProcessedNodeMetrics {
  name: string;
  cpuUsage: string;
  memoryUsage: string;
  cpuPercent: number;
  memoryPercent: number;
  status: string;
  roles: string;
  age: string;
  version: string;
}

export interface ClusterStats {
  totalPods: number;
  runningPods: number;
  services: number;
  deployments: number;
  namespaces: string[];
  clusterName: string;
  nodeMetrics: ProcessedNodeMetrics[];
  podMetrics: ProcessedPodMetrics[];
  servicesList: ProcessedServiceInfo[];
  deploymentsList: ProcessedDeploymentInfo[];
  healthy: boolean;
  version?: string;
  lastUpdated: string;
}

export const useKubernetesCluster = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [stats, setStats] = useState<ClusterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClusterData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting cluster data fetch...');

      // Verificar conectividad primero
      let healthCheck;
      try {
        healthCheck = await kubernetesApi.healthCheck();
        console.log('🏥 Health check result:', healthCheck);
      } catch (healthError) {
        console.warn('⚠️ Health check failed, using mock data:', healthError);
        // Si el health check falla, usar datos mock
        setStats(createMockClusterStats());
        setError(null);
        return;
      }

      if (!healthCheck.healthy) {
        console.warn('⚠️ Cluster unhealthy, using mock data');
        setStats(createMockClusterStats());
        setError(null);
        return;
      }

      // Obtener datos en paralelo
      const [
        pods,
        services,
        deployments,
        nodes,
        namespaces,
        podMetrics,
        nodeMetrics,
      ] = await Promise.allSettled([
        kubernetesApi.getPods(),
        kubernetesApi.getServices(),
        kubernetesApi.getDeployments(),
        kubernetesApi.getNodes(),
        kubernetesApi.getNamespaces(),
        kubernetesApi.getPodMetrics(),
        kubernetesApi.getNodeMetrics(),
      ]);

      // Procesar pods
      const podsData = pods.status === 'fulfilled' ? pods.value : [];
      const podMetricsData = podMetrics.status === 'fulfilled' ? podMetrics.value : [];

      const processedPods: ProcessedPodMetrics[] = podsData.map((pod: PodStatus) => {
        const podMetric = podMetricsData.find(
          (m: PodMetrics) => m.name === pod.metadata.name && m.namespace === pod.metadata.namespace
        );

        const containerRestarts = pod.status.conditions?.find(c => c.type === 'Ready')?.status === 'True' ? 0 : 1;
        const readyContainers = pod.spec.containers.length;
        const totalContainers = pod.spec.containers.length;

        let cpuUsage = '0m';
        let memoryUsage = '0Mi';

        if (podMetric?.containers?.[0]) {
          cpuUsage = formatCpu(podMetric.containers[0].usage.cpu);
          memoryUsage = formatMemory(podMetric.containers[0].usage.memory);
        }

        return {
          name: pod.metadata.name,
          namespace: pod.metadata.namespace,
          status: pod.status.phase,
          cpuUsage,
          memoryUsage,
          restarts: containerRestarts,
          node: pod.spec.nodeName || 'Unknown',
          ready: `${readyContainers}/${totalContainers}`,
          age: formatAge(pod.metadata.creationTimestamp),
          labels: pod.metadata.labels,
          image: pod.spec.containers[0]?.image || 'Unknown',
        };
      });

      // Procesar services
      const servicesData = services.status === 'fulfilled' ? services.value : [];
      const processedServices: ProcessedServiceInfo[] = servicesData.map((service: ServiceStatus) => ({
        name: service.metadata.name,
        namespace: service.metadata.namespace,
        type: service.spec.type,
        clusterIP: service.spec.clusterIP,
        ports: service.spec.ports.map(p => `${p.port}/${p.protocol}`).join(','),
        age: formatAge(service.metadata.creationTimestamp),
      }));

      // Procesar deployments
      const deploymentsData = deployments.status === 'fulfilled' ? deployments.value : [];
      const processedDeployments: ProcessedDeploymentInfo[] = deploymentsData.map((deployment: DeploymentStatus) => ({
        name: deployment.metadata.name,
        namespace: deployment.metadata.namespace,
        ready: `${deployment.status.readyReplicas || 0}/${deployment.spec.replicas}`,
        upToDate: deployment.status.updatedReplicas || 0,
        available: deployment.status.availableReplicas || 0,
        age: formatAge(deployment.metadata.creationTimestamp),
      }));

      // Procesar nodes
      const nodesData = nodes.status === 'fulfilled' ? nodes.value : [];
      const nodeMetricsData = nodeMetrics.status === 'fulfilled' ? nodeMetrics.value : [];

      const processedNodes: ProcessedNodeMetrics[] = nodesData.map((node: NodeStatus) => {
        const nodeMetric = nodeMetricsData.find((m: NodeMetrics) => m.name === node.metadata.name);

        const readyCondition = node.status.conditions.find(c => c.type === 'Ready');
        const status = readyCondition?.status === 'True' ? 'Ready' : 'NotReady';

        const roles = node.metadata.labels?.['node-role.kubernetes.io/control-plane'] ? 'control-plane' : 'worker';

        let cpuUsage = '0m';
        let memoryUsage = '0Mi';
        let cpuPercent = 0;
        let memoryPercent = 0;

        if (nodeMetric) {
          cpuUsage = formatCpu(nodeMetric.usage.cpu);
          memoryUsage = formatMemory(nodeMetric.usage.memory);

          // Calcular porcentajes aproximados (necesitaríamos capacity para ser exactos)
          cpuPercent = Math.min(parseInt(cpuUsage.replace('m', '')) / 20, 100); // Asumiendo ~2000m capacity
          memoryPercent = Math.min(parseInt(memoryUsage.replace('Mi', '')) / 40, 100); // Asumiendo ~4000Mi capacity
        }

        return {
          name: node.metadata.name,
          cpuUsage,
          memoryUsage,
          cpuPercent,
          memoryPercent,
          status,
          roles,
          age: formatAge(node.metadata.creationTimestamp),
          version: node.status.nodeInfo.kubeletVersion,
        };
      });

      // Crear estadísticas del cluster
      const namespacesData = namespaces.status === 'fulfilled' ? namespaces.value : [];
      const runningPods = processedPods.filter(p => p.status === 'Running').length;

      const clusterStats: ClusterStats = {
        totalPods: processedPods.length,
        runningPods,
        services: processedServices.length,
        deployments: processedDeployments.length,
        namespaces: namespacesData,
        clusterName: process.env.CLUSTER_NAME || 'kubernetes-cluster',
        nodeMetrics: processedNodes,
        podMetrics: processedPods,
        servicesList: processedServices,
        deploymentsList: processedDeployments,
        healthy: healthCheck.healthy,
        version: healthCheck.version,
        lastUpdated: new Date().toLocaleTimeString(),
      };

      setStats(clusterStats);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cluster data';
      console.error('❌ Error fetching cluster data, falling back to mock data:', err);
      // Fallback to mock data instead of showing error
      setStats(createMockClusterStats());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inicial
  useEffect(() => {
    fetchClusterData();
  }, [fetchClusterData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchClusterData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchClusterData]);

  const refreshManually = useCallback(() => {
    fetchClusterData();
  }, [fetchClusterData]);

  return {
    stats,
    loading,
    error,
    refresh: refreshManually,
    isConnected: stats?.healthy || false,
  };
};

// Mock data function for fallback when Kubernetes is not available
const createMockClusterStats = (): ClusterStats => {
  const mockPods: ProcessedPodMetrics[] = [
    {
      name: 'argocd-server-799cb7b684-x9gz9',
      namespace: 'argocd',
      status: 'Running',
      cpuUsage: '50m',
      memoryUsage: '256Mi',
      restarts: 0,
      node: 'kind-control-plane',
      ready: '1/1',
      age: '14d',
      image: 'argoproj/argocd:v2.8.4',
    },
    {
      name: 'backstage-5bddbc7747-7xjhk',
      namespace: 'backstage',
      status: 'Running',
      cpuUsage: '75m',
      memoryUsage: '512Mi',
      restarts: 0,
      node: 'kind-control-plane',
      ready: '1/1',
      age: '27m',
      image: 'backstage:latest',
    },
    {
      name: 'python-app-100-6c49cf5475-5sb5q',
      namespace: 'dev1',
      status: 'Running',
      cpuUsage: '25m',
      memoryUsage: '128Mi',
      restarts: 1,
      node: 'kind-control-plane',
      ready: '1/1',
      age: '27h',
      image: 'python:3.9-slim',
    },
    {
      name: 'python-app-40-58d95454d-l6l2z',
      namespace: 'prod1',
      status: 'Running',
      cpuUsage: '30m',
      memoryUsage: '200Mi',
      restarts: 0,
      node: 'kind-control-plane',
      ready: '1/1',
      age: '3d',
      image: 'python:3.9-slim',
    },
  ];

  const mockNodes: ProcessedNodeMetrics[] = [
    {
      name: 'kind-control-plane',
      cpuUsage: '180m',
      memoryUsage: '1096Mi',
      cpuPercent: 9,
      memoryPercent: 27,
      status: 'Ready',
      roles: 'control-plane',
      age: '15d',
      version: 'v1.34.0',
    },
  ];

  return {
    totalPods: mockPods.length,
    runningPods: mockPods.filter(p => p.status === 'Running').length,
    services: 8,
    deployments: 6,
    namespaces: ['argocd', 'backstage', 'dev1', 'prod1', 'sit1', 'kube-system'],
    clusterName: 'kind-kind',
    nodeMetrics: mockNodes,
    podMetrics: mockPods,
    servicesList: [],
    deploymentsList: [],
    healthy: false, // Indicate this is mock data
    version: '1.34.0',
    lastUpdated: new Date().toLocaleTimeString(),
  };
};