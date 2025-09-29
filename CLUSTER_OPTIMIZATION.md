# 🚀 Cluster Kubernetes Optimización y Configuración

## 📋 Estado Final del Cluster

### ✅ Servicios Funcionando

- **ArgoCD**: `https://argocd.test.com` - ✅ Operativo
- **Prometheus**: `http://prometheus.test.com` - ✅ Operativo
- **Grafana**: `http://grafana.test.com` - ✅ Operativo
- **Backstage**: Funcionando con integración completa

### 📊 Recursos Optimizados

**Antes de optimización:**
- CPU: 89% utilizado
- Memory: 55% utilizada

**Después de optimización:**
- CPU: 85% utilizado (-4%)
- Memory: 46% utilizada (-9%)

## 🔧 Optimizaciones Aplicadas

### 1. **Resource Quotas por Namespace**

```yaml
# backstage-quota
requests.cpu: "1000m", limits.cpu: "2000m"
requests.memory: "2Gi", limits.memory: "4Gi"

# monitoring-quota
requests.cpu: "1500m", limits.cpu: "3000m"
requests.memory: "3Gi", limits.memory: "6Gi"

# argocd-quota
requests.cpu: "800m", limits.cpu: "1500m"
requests.memory: "2Gi", limits.memory: "4Gi"

# python-quota (aplicaciones de prueba)
requests.cpu: "200m", limits.cpu: "400m"
requests.memory: "256Mi", limits.memory: "512Mi"

# gitops1-quota
requests.cpu: "100m", limits.cpu: "200m"
requests.memory: "128Mi", limits.memory: "256Mi"

# default-quota (runners)
requests.cpu: "500m", limits.cpu: "1000m"
requests.memory: "1Gi", limits.memory: "2Gi"
```

### 2. **Resource Limits en Servicios Críticos**

**Backstage:**
- Requests: 200Mi RAM, 100m CPU
- Limits: 500Mi RAM, 300m CPU

**Actions Runner Controller:**
- Requests: 64Mi RAM, 50m CPU
- Limits: 256Mi RAM, 200m CPU

**Grafana:**
- Container: 128Mi-256Mi RAM, 100m-200m CPU
- Sidecars: 32Mi-64Mi RAM, 10m-50m CPU

**Prometheus:**
- Requests: 400Mi RAM, 200m CPU
- Limits: 800Mi RAM, 500m CPU

### 3. **DNS Mapping para DevContainer**

```yaml
# .devcontainer/docker-compose.yml
extra_hosts:
  - "argocd.test.com:host-gateway"
  - "grafana.test.com:host-gateway"
  - "prometheus.test.com:host-gateway"
  - "backstage.test.com:host-gateway"
  - "backstage.kind.local:host-gateway"
```

### 4. **Eliminación de Duplicados**

- ✅ Eliminado: `monitoring-stack` (duplicado problemático)
- ✅ Mantenido: `kube-prometheus-stack` (estable)
- ✅ Backstage: Reducido a 1 replica cada instancia
- ✅ Eliminados: Pods duplicados y StatefulSets problemáticos

## 🔍 Comandos de Diagnóstico

### Verificar Recursos
```bash
# Uso actual del nodo
kubectl top node kind-control-plane

# Top pods por consumo de CPU
kubectl top pods --all-namespaces --sort-by=cpu | head -15

# Verificar resource quotas
kubectl get resourcequotas --all-namespaces
```

### Verificar Servicios
```bash
# Estado de pods críticos
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
kubectl get pods -n argocd -l app.kubernetes.io/component=server
kubectl get pods -n backstage

# Verificar Ingress
kubectl get ingress --all-namespaces
```

### Probar Conectividad (desde DevContainer)
```bash
curl -k -I https://argocd.test.com      # ArgoCD
curl -I http://prometheus.test.com      # Prometheus
curl -I http://grafana.test.com         # Grafana
```

## 🚨 Resolución de Problemas Comunes

### Si Grafana no arranca
```bash
# Problema: init-chown-data con permisos
kubectl scale deployment -n monitoring kube-prometheus-stack-grafana --replicas=0
kubectl delete pvc -n monitoring kube-prometheus-stack-grafana
kubectl apply -f /tmp/grafana-pvc.yaml  # PVC limpio
kubectl scale deployment -n monitoring kube-prometheus-stack-grafana --replicas=1
```

### Si ArgoCD da 502
```bash
# Reiniciar ArgoCD server
kubectl rollout restart deployment -n argocd argocd-server
kubectl get pods -n argocd -l app.kubernetes.io/component=server
```

### Si el cluster consume demasiados recursos
```bash
# Verificar pods con más consumo
kubectl top pods --all-namespaces --sort-by=cpu | head -10

# Aplicar resource quotas adicionales
kubectl apply -f /tmp/resource-quotas.yaml
```

## 📁 Archivos de Configuración

### `/tmp/resource-quotas.yaml`
Resource quotas para todos los namespaces (ya aplicado)

### `/tmp/grafana-pvc.yaml`
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: kube-prometheus-stack-grafana
  namespace: monitoring
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 2Gi
  storageClassName: standard
```

## 🎯 Estado Final del DevContainer

### Variables de Entorno (.env)
```env
# Kubernetes URLs usando Ingress
KUBERNETES_URL=http://argocd.test.com
ARGOCD_URL=http://argocd.test.com
GRAFANA_URL=http://grafana.test.com
PROMETHEUS_URL=http://prometheus.test.com
```

### Configuración Backstage (app-config.local.yaml)
```yaml
# Proxy configuration
proxy:
  '/argocd/api':
    target: http://argocd.test.com/api/v1/
    changeOrigin: true
    secure: false
```

## 🔄 Para Reiniciar Después del Reboot

1. **Verificar cluster kind:**
   ```bash
   kind get clusters
   kubectl cluster-info --context kind-kind
   ```

2. **Verificar todos los servicios:**
   ```bash
   kubectl get pods --all-namespaces | grep -E "(Running|Pending|Error)"
   ```

3. **Probar conectividad DevContainer:**
   ```bash
   # Desde el devcontainer
   curl -k -I https://argocd.test.com
   curl -I http://prometheus.test.com
   curl -I http://grafana.test.com
   ```

4. **Iniciar Backstage:**
   ```bash
   cd /workspaces/backstage-app-devc/backstage
   yarn dev
   ```

## 💡 Mejoras Futuras

1. **Priority Classes** para servicios críticos
2. **Horizontal Pod Autoscaler** para Backstage
3. **Persistent Volumes** optimizados para mejor rendimiento
4. **Network Policies** para seguridad
5. **Monitoring adicional** con AlertManager

---

**📅 Última actualización:** 29 Sep 2025
**🎯 Objetivo:** Cluster Kubernetes estable y optimizado para Backstage
**✅ Estado:** Funcional y optimizado