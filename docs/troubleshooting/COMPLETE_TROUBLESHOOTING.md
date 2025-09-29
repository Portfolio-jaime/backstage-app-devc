# 🛟 Complete Troubleshooting Guide

## 📋 Quick Diagnosis Commands

### System Health Check

```bash
#!/bin/bash
echo "🏥 SYSTEM HEALTH CHECK"
echo "======================"

# Kubernetes cluster health
echo "🔍 Kubernetes Cluster:"
kubectl get nodes
kubectl get pods --all-namespaces --field-selector=status.phase!=Running

# ArgoCD health
echo -e "\n🔄 ArgoCD Status:"
kubectl get pods -n argocd
kubectl get ingress -n argocd

# Monitoring health
echo -e "\n📊 Monitoring Stack:"
kubectl get pods -n monitoring
kubectl get pvc -n monitoring

# Port-forward processes
echo -e "\n🚀 Port Forward Processes:"
ps aux | grep "port-forward" | grep -v grep

# Ingress controller
echo -e "\n🌐 Ingress Controller:"
kubectl get pods -n ingress-nginx

# Service status
echo -e "\n🔗 Service Status:"
kubectl get svc --all-namespaces | grep -E "(argocd|monitoring|ingress)"
```

### Quick Fix Script

```bash
#!/bin/bash
echo "🔧 QUICK FIX SCRIPT"
echo "==================="

# Kill existing port-forwards
echo "🛑 Stopping existing port-forwards..."
pkill -f "port-forward" 2>/dev/null
pkill -f "kubectl proxy" 2>/dev/null

# Wait a moment
sleep 2

# Restart essential port-forwards
echo "🚀 Starting port-forwards..."
kubectl proxy --port=8001 > /dev/null 2>&1 &
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3010:80 > /dev/null 2>&1 &
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090 > /dev/null 2>&1 &

echo "✅ Port-forwards restarted!"
echo "📊 Services available at:"
echo "   - Kubernetes API: http://localhost:8001"
echo "   - ArgoCD: http://localhost:8080"
echo "   - Grafana: http://localhost:3010"
echo "   - Prometheus: http://localhost:9090"
```

## 🚨 Common Issues & Solutions

### 1. Backstage Issues

#### Issue: Backstage Shows Mock Data Instead of Real Data

**Symptoms:**
- Kubernetes page shows fake pods
- ArgoCD page shows sample applications
- Prometheus/Grafana show mock metrics

**Diagnosis:**
```bash
# Check environment variables
cat backstage/.env | grep REACT_APP

# Verify port-forwards are running
ps aux | grep "port-forward"

# Test API endpoints
curl -s http://localhost:8001/api/v1/namespaces | jq '.items[].metadata.name'
curl -s http://localhost:8080/api/version
curl -s http://localhost:9090/api/v1/status/buildinfo
```

**Solutions:**

1. **Fix Port-Forwards:**
```bash
# Restart all port-forwards
pkill -f "port-forward"
kubectl proxy --port=8001 &
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3010:80 &
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090 &
```

2. **Update Environment Variables:**
```bash
# Verify URLs in .env file
REACT_APP_KUBERNETES_URL=http://localhost:8001
REACT_APP_ARGOCD_URL=http://argocd.test.com  # or http://localhost:8080
REACT_APP_PROMETHEUS_URL=http://prometheus.test.com  # or http://localhost:9090
REACT_APP_GRAFANA_URL=http://grafana.test.com  # or http://localhost:3010
```

3. **Restart Backstage:**
```bash
cd backstage
yarn dev
```

#### Issue: Backstage Won't Start

**Symptoms:**
- `yarn dev` fails with errors
- Port 3001 already in use
- Database connection errors

**Solutions:**

1. **Kill Existing Process:**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

2. **Clear Cache and Reinstall:**
```bash
# Clear yarn cache
yarn cache clean

# Remove node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install

# Clear build cache
rm -rf dist packages/*/dist
```

3. **Database Issues:**
```bash
# If using local PostgreSQL
brew services restart postgresql
# or
sudo systemctl restart postgresql

# Check database connection
psql -h localhost -p 5432 -U backstage -d backstage -c "SELECT 1;"
```

### 2. Kubernetes Issues

#### Issue: Kind Cluster Not Responding

**Symptoms:**
- `kubectl get nodes` hangs or fails
- Cluster not found errors
- Connection refused errors

**Diagnosis:**
```bash
# Check if cluster exists
kind get clusters

# Check cluster status
docker ps | grep kind

# Verify kubeconfig
kubectl config current-context
kubectl config get-contexts
```

**Solutions:**

1. **Restart Kind Cluster:**
```bash
# Stop cluster
kind delete cluster --name kind

# Recreate cluster
kind create cluster --name kind
```

2. **Fix Kubeconfig:**
```bash
# Update kubeconfig
kind export kubeconfig --name kind

# Or set context manually
kubectl config use-context kind-kind
```

3. **Check Docker:**
```bash
# Ensure Docker is running
docker info

# Restart Docker Desktop if needed
```

#### Issue: Pods Stuck in Pending/CrashLoopBackOff

**Symptoms:**
- Pods not starting
- Resource constraints
- Image pull failures

**Diagnosis:**
```bash
# Check pod status
kubectl get pods --all-namespaces

# Describe problematic pods
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace> --previous
```

**Solutions:**

1. **Resource Issues:**
```bash
# Check node resources
kubectl top nodes
kubectl describe node kind-control-plane

# Free up resources
docker system prune -f
```

2. **Image Issues:**
```bash
# Pull images manually
docker pull <image-name>

# Or restart the pods
kubectl delete pod <pod-name> -n <namespace>
```

### 3. ArgoCD Issues

#### Issue: ArgoCD Not Accessible

**Symptoms:**
- Can't access ArgoCD UI
- Login page not loading
- Certificate errors

**Diagnosis:**
```bash
# Check ArgoCD pods
kubectl get pods -n argocd

# Check ArgoCD service
kubectl get svc -n argocd

# Check ingress
kubectl get ingress -n argocd
```

**Solutions:**

1. **Restart ArgoCD:**
```bash
# Restart ArgoCD server
kubectl rollout restart deployment/argocd-server -n argocd

# Wait for rollout
kubectl rollout status deployment/argocd-server -n argocd
```

2. **Fix Port-Forward:**
```bash
# Kill existing port-forward
pkill -f "argocd-server"

# Start new port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
```

3. **Reset Admin Password:**
```bash
# Get initial password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Or set custom password
kubectl -n argocd patch secret argocd-secret \
  -p '{"stringData": {"admin.password": "$2a$10$rRyBsGSHK6.uc8fntPwVIuLVHgsAhAX7TcdrqW/RADU0uh7CaChLa","admin.passwordMtime": "'$(date +%FT%T%Z)'"}}'
```

#### Issue: ArgoCD Applications Not Syncing

**Symptoms:**
- Applications stuck in "OutOfSync" status
- Sync errors in application details
- Health status "Unknown" or "Degraded"

**Diagnosis:**
```bash
# Check application status
kubectl get applications -n argocd

# Get application details
kubectl describe application monitoring-stack -n argocd

# Check ArgoCD server logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server --tail=100
```

**Solutions:**

1. **Manual Sync:**
```bash
# Force sync application
kubectl patch app monitoring-stack -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD","prune":true}}}'

# Or sync all applications
kubectl get applications -n argocd -o name | xargs -I {} kubectl patch {} --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'
```

2. **Fix Repository Access:**
```bash
# Check if repository is accessible
curl -I https://prometheus-community.github.io/helm-charts/

# Update Helm repo in ArgoCD
kubectl exec -it deployment/argocd-server -n argocd -- argocd repo list
```

### 4. Monitoring Issues

#### Issue: Prometheus Not Collecting Metrics

**Symptoms:**
- Empty dashboards in Grafana
- No targets in Prometheus
- Missing metrics

**Diagnosis:**
```bash
# Check Prometheus targets
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090 &
# Navigate to http://localhost:9090/targets

# Check service discovery
kubectl get servicemonitor -n monitoring
kubectl get endpoints -n monitoring

# Check pod logs
kubectl logs -n monitoring -l app.kubernetes.io/name=prometheus --tail=100
```

**Solutions:**

1. **Restart Prometheus:**
```bash
# Restart Prometheus
kubectl rollout restart statefulset/prometheus-kube-prometheus-stack-prometheus -n monitoring

# Wait for restart
kubectl rollout status statefulset/prometheus-kube-prometheus-stack-prometheus -n monitoring
```

2. **Fix Service Discovery:**
```bash
# Check RBAC permissions
kubectl get clusterrole prometheus-kube-prometheus-stack-prometheus
kubectl get clusterrolebinding prometheus-kube-prometheus-stack-prometheus

# Recreate service monitors
kubectl delete servicemonitor --all -n monitoring
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring --reuse-values
```

#### Issue: Grafana Dashboards Empty

**Symptoms:**
- No data in Grafana dashboards
- "No data" messages
- Query errors

**Diagnosis:**
```bash
# Check Grafana logs
kubectl logs -n monitoring -l app.kubernetes.io/name=grafana --tail=100

# Test Prometheus data source
curl -s http://localhost:9090/api/v1/query?query=up
```

**Solutions:**

1. **Fix Data Source:**
```bash
# Port-forward to Grafana
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3010:80 &

# Login to Grafana (admin/admin123)
# Go to Configuration > Data Sources
# Test Prometheus connection: http://kube-prometheus-stack-prometheus.monitoring.svc.cluster.local:9090
```

2. **Import Default Dashboards:**
```bash
# Reinstall Grafana with dashboards
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set grafana.defaultDashboardsEnabled=true \
  --reuse-values
```

### 5. Network Issues

#### Issue: Ingress Not Working

**Symptoms:**
- Can't access `*.test.com` domains
- DNS resolution failures
- 404 errors

**Diagnosis:**
```bash
# Check /etc/hosts
cat /etc/hosts | grep test.com

# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress rules
kubectl get ingress --all-namespaces

# Test with curl
curl -H "Host: argocd.test.com" http://localhost
```

**Solutions:**

1. **Fix /etc/hosts:**
```bash
# Add missing entries
echo "127.0.0.1 argocd.test.com" | sudo tee -a /etc/hosts
echo "127.0.0.1 grafana.test.com" | sudo tee -a /etc/hosts
echo "127.0.0.1 prometheus.test.com" | sudo tee -a /etc/hosts
```

2. **Restart Ingress Controller:**
```bash
# Restart ingress controller
kubectl rollout restart deployment/ingress-nginx-controller -n ingress-nginx

# Wait for restart
kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx
```

3. **Recreate Ingress Rules:**
```bash
# Delete and recreate ingress
kubectl delete ingress --all -n argocd
kubectl delete ingress --all -n monitoring

# Reapply ingress configurations
kubectl apply -f kubernetes/ingress-monitoring.yaml
```

#### Issue: Port Conflicts

**Symptoms:**
- "Port already in use" errors
- Services not accessible on expected ports
- Connection refused errors

**Diagnosis:**
```bash
# Check what's using ports
lsof -i :3001  # Backstage
lsof -i :8080  # ArgoCD
lsof -i :9090  # Prometheus
lsof -i :3010  # Grafana
lsof -i :8001  # Kubernetes API

# Check port-forward processes
ps aux | grep "port-forward"
```

**Solutions:**

1. **Kill Conflicting Processes:**
```bash
# Kill specific port users
lsof -ti:3001 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:9090 | xargs kill -9
lsof -ti:3010 | xargs kill -9
lsof -ti:8001 | xargs kill -9

# Or kill all port-forwards
pkill -f "port-forward"
pkill -f "kubectl proxy"
```

2. **Use Different Ports:**
```bash
# Alternative port configurations
kubectl port-forward svc/argocd-server -n argocd 8081:443 &
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3011:80 &
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9091:9090 &
kubectl proxy --port=8002 &

# Update .env file accordingly
```

## 🔧 Recovery Procedures

### Complete System Recovery

```bash
#!/bin/bash
echo "🚨 COMPLETE SYSTEM RECOVERY"
echo "==========================="

# 1. Stop all processes
echo "🛑 Stopping all processes..."
pkill -f "port-forward"
pkill -f "kubectl proxy"
pkill -f "yarn dev"

# 2. Reset Kind cluster
echo "🔄 Resetting Kind cluster..."
kind delete cluster --name kind
kind create cluster --name kind

# 3. Wait for cluster to be ready
echo "⏳ Waiting for cluster..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

# 4. Reinstall ingress
echo "🌐 Installing ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s

# 5. Reinstall ArgoCD
echo "🔄 Installing ArgoCD..."
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# 6. Reinstall monitoring
echo "📊 Installing monitoring stack..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword="admin123" \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage="5Gi" \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size="2Gi" \
  --timeout=600s

kubectl wait --for=condition=Ready pods -l "release=kube-prometheus-stack" -n monitoring --timeout=300s

# 7. Apply ingress rules
echo "🌐 Configuring ingress..."
kubectl apply -f kubernetes/ingress-monitoring.yaml

# 8. Start port-forwards
echo "🚀 Starting port-forwards..."
kubectl proxy --port=8001 > /dev/null 2>&1 &
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3010:80 > /dev/null 2>&1 &
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090 > /dev/null 2>&1 &

echo "✅ System recovery complete!"
echo "🚀 You can now start Backstage with: cd backstage && yarn dev"
```

### Backstage Recovery

```bash
#!/bin/bash
echo "🚪 BACKSTAGE RECOVERY"
echo "===================="

cd backstage

# 1. Stop Backstage
echo "🛑 Stopping Backstage..."
pkill -f "yarn dev"
pkill -f "backstage"

# 2. Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf dist packages/*/dist
rm -rf node_modules/.cache

# 3. Clear yarn cache
echo "🗑️ Clearing yarn cache..."
yarn cache clean

# 4. Reinstall dependencies
echo "📦 Reinstalling dependencies..."
rm -rf node_modules yarn.lock
yarn install --frozen-lockfile

# 5. Rebuild packages
echo "🔨 Building packages..."
yarn build:backend
yarn build

# 6. Start fresh
echo "🚀 Starting Backstage..."
yarn dev
```

## 📊 Monitoring & Health Checks

### Automated Health Check Script

```bash
#!/bin/bash
# health-check.sh - Automated health monitoring

FAILED_CHECKS=""

check_service() {
    local service=$1
    local url=$2
    local expected_code=${3:-200}

    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: FAILED"
        FAILED_CHECKS="$FAILED_CHECKS $service"
    fi
}

echo "🏥 HEALTH CHECK REPORT"
echo "====================="
echo "Timestamp: $(date)"
echo ""

# Check Kubernetes
if kubectl get nodes &>/dev/null; then
    echo "✅ Kubernetes: OK"
else
    echo "❌ Kubernetes: FAILED"
    FAILED_CHECKS="$FAILED_CHECKS Kubernetes"
fi

# Check services
check_service "Backstage" "http://localhost:3001"
check_service "ArgoCD" "http://localhost:8080" "200|302"
check_service "Grafana" "http://localhost:3010"
check_service "Prometheus" "http://localhost:9090"
check_service "K8s API" "http://localhost:8001/api/v1"

# Check ingress
check_service "ArgoCD Ingress" "http://argocd.test.com" "200|302"
check_service "Grafana Ingress" "http://grafana.test.com"
check_service "Prometheus Ingress" "http://prometheus.test.com"

echo ""
if [ -z "$FAILED_CHECKS" ]; then
    echo "🎉 All systems operational!"
    exit 0
else
    echo "🚨 Failed checks:$FAILED_CHECKS"
    echo "Run troubleshooting procedures for failed services."
    exit 1
fi
```

### Performance Monitoring

```bash
#!/bin/bash
# performance-check.sh - System performance monitoring

echo "📊 PERFORMANCE REPORT"
echo "===================="
echo "Timestamp: $(date)"
echo ""

# Kubernetes cluster resources
echo "🏗️ Cluster Resources:"
kubectl top nodes 2>/dev/null || echo "Metrics server not available"
echo ""

# Pod resource usage
echo "📦 Pod Resources (Top 10):"
kubectl top pods --all-namespaces --sort-by=cpu 2>/dev/null | head -11 || echo "Metrics server not available"
echo ""

# Storage usage
echo "💾 Storage Usage:"
kubectl get pvc --all-namespaces
echo ""

# Docker system info
echo "🐳 Docker System:"
docker system df
echo ""

# Memory and CPU on host
echo "💻 Host Resources:"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "CPU Load: $(uptime | awk -F'load average:' '{ print $2 }')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
```

---

## 🆘 Emergency Contacts & Resources

### Quick Reference Commands

```bash
# Emergency cluster reset
kind delete cluster --name kind && kind create cluster --name kind

# Emergency port-forward restart
pkill -f "port-forward" && ./scripts/start-port-forwards.sh

# Emergency Backstage restart
cd backstage && pkill -f "yarn dev" && yarn dev

# Emergency log collection
kubectl logs --all-containers=true --since=1h --all-namespaces > emergency-logs.txt
```

### Log Collection

```bash
#!/bin/bash
# collect-logs.sh - Emergency log collection

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="emergency-logs-$TIMESTAMP"
mkdir -p "$LOG_DIR"

echo "📋 Collecting emergency logs..."

# Kubernetes events
kubectl get events --all-namespaces --sort-by='.lastTimestamp' > "$LOG_DIR/k8s-events.log"

# Pod logs
for namespace in argocd monitoring kube-system; do
    kubectl logs --all-containers=true --since=2h -n $namespace > "$LOG_DIR/${namespace}-pods.log" 2>&1
done

# System info
kubectl get nodes -o wide > "$LOG_DIR/nodes.log"
kubectl get pods --all-namespaces -o wide > "$LOG_DIR/all-pods.log"
kubectl get svc --all-namespaces > "$LOG_DIR/services.log"
kubectl get ingress --all-namespaces > "$LOG_DIR/ingress.log"

# Docker info
docker ps > "$LOG_DIR/docker-ps.log"
docker system df > "$LOG_DIR/docker-df.log"

# Host info
uname -a > "$LOG_DIR/host-info.log"
free -h >> "$LOG_DIR/host-info.log"
df -h >> "$LOG_DIR/host-info.log"

tar -czf "emergency-logs-$TIMESTAMP.tar.gz" "$LOG_DIR"
rm -rf "$LOG_DIR"

echo "✅ Logs collected: emergency-logs-$TIMESTAMP.tar.gz"
```

---

**🛟 Remember: When in doubt, try the complete system recovery procedure. It's designed to restore everything to a working state.**