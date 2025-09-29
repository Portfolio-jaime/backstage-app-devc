import { useState, useEffect, useCallback } from 'react';
import {
  argoCDApi,
  ArgoCDApplication,
  ArgoCDProject,
  ArgoCDRepository,
} from '../api/argoCDApi';

export interface ArgoCDStats {
  applications: ArgoCDApplication[];
  projects: ArgoCDProject[];
  repositories: ArgoCDRepository[];
  totalApplications: number;
  syncedApplications: number;
  healthyApplications: number;
  outOfSyncApplications: number;
  degradedApplications: number;
  lastUpdated: string;
  healthy: boolean;
  version?: string;
}

export const useArgoCD = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [stats, setStats] = useState<ArgoCDStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArgoCDData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching ArgoCD data...', forceRefresh ? '(force refresh)' : '');

      // Verificar conectividad primero
      const healthCheck = await argoCDApi.healthCheck();
      console.log('🏥 ArgoCD Health Check:', healthCheck);

      // Obtener datos en paralelo con opción de refresh
      const [applications, projects, repositories] = await Promise.allSettled([
        argoCDApi.getApplications(forceRefresh),
        argoCDApi.getProjects(),
        argoCDApi.getRepositories(),
      ]);

      // Procesar resultados
      const applicationsData = applications.status === 'fulfilled' ? applications.value : [];
      const projectsData = projects.status === 'fulfilled' ? projects.value : [];
      const repositoriesData = repositories.status === 'fulfilled' ? repositories.value : [];

      // Log de datos obtenidos
      console.log('📊 ArgoCD Data Summary:', {
        applications: applicationsData.length,
        projects: projectsData.length,
        repositories: repositoriesData.length,
      });

      // Calcular estadísticas detalladas
      const totalApplications = applicationsData.length;
      const syncedApplications = applicationsData.filter(app =>
        app.status?.sync?.status === 'Synced'
      ).length;
      const healthyApplications = applicationsData.filter(app =>
        app.status?.health?.status === 'Healthy'
      ).length;
      const outOfSyncApplications = applicationsData.filter(app =>
        app.status?.sync?.status === 'OutOfSync'
      ).length;
      const degradedApplications = applicationsData.filter(app =>
        app.status?.health?.status === 'Degraded'
      ).length;

      const argoCDStats: ArgoCDStats = {
        applications: applicationsData,
        projects: projectsData,
        repositories: repositoriesData,
        totalApplications,
        syncedApplications,
        healthyApplications,
        outOfSyncApplications,
        degradedApplications,
        lastUpdated: new Date().toLocaleTimeString(),
        healthy: healthCheck.healthy,
        version: healthCheck.version,
      };

      console.log('✅ ArgoCD Stats calculated:', {
        totalApplications,
        syncedApplications,
        healthyApplications,
        outOfSyncApplications,
        degradedApplications,
        healthy: healthCheck.healthy,
      });

      setStats(argoCDStats);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ArgoCD data';
      console.error('❌ Error fetching ArgoCD data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inicial
  useEffect(() => {
    fetchArgoCDData();
  }, [fetchArgoCDData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchArgoCDData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchArgoCDData]);

  const refreshManually = useCallback((forceRefresh = true) => {
    console.log('🔄 Manual refresh triggered');
    fetchArgoCDData(forceRefresh);
  }, [fetchArgoCDData]);

  const syncApplication = useCallback(async (appName: string, options?: {
    prune?: boolean;
    dryRun?: boolean;
  }) => {
    try {
      console.log(`🔄 Syncing application: ${appName}`);
      const result = await argoCDApi.syncApplication(appName, {
        prune: options?.prune || false,
        dryRun: options?.dryRun || false,
      });

      // Refresh data after sync to get updated status
      setTimeout(() => {
        fetchArgoCDData(true);
      }, 2000); // Wait 2 seconds for sync to start

      return { success: true, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error syncing application ${appName}:`, error);
      return { success: false, error: errorMessage };
    }
  }, [fetchArgoCDData]);

  const refreshApplication = useCallback(async (appName: string, type: 'normal' | 'hard' = 'normal') => {
    try {
      console.log(`🔄 Refreshing application: ${appName} (${type})`);
      const result = await argoCDApi.refreshApplication(appName, type);

      // Refresh data after refresh to get updated status
      setTimeout(() => {
        fetchArgoCDData(true);
      }, 1000); // Wait 1 second for refresh to complete

      return { success: true, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error refreshing application ${appName}:`, error);
      return { success: false, error: errorMessage };
    }
  }, [fetchArgoCDData]);

  const deleteApplication = useCallback(async (appName: string, cascade = false) => {
    try {
      console.log(`🗑️ Deleting application: ${appName} (cascade: ${cascade})`);
      const result = await argoCDApi.deleteApplication(appName, cascade);

      // Refresh data after delete to remove from list
      setTimeout(() => {
        fetchArgoCDData(true);
      }, 1000);

      return { success: true, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error deleting application ${appName}:`, error);
      return { success: false, error: errorMessage };
    }
  }, [fetchArgoCDData]);

  return {
    stats,
    loading,
    error,
    refresh: refreshManually,
    syncApplication,
    refreshApplication,
    deleteApplication,
    isConnected: stats?.healthy || false,
  };
};