# 🚀 Step-by-Step Setup Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have all required tools installed:

```bash
# ✅ Check Docker
docker --version
# Expected: Docker version 20.x or higher

# ✅ Check Kubernetes CLI
kubectl version --client
# Expected: Client Version: v1.28.x or higher

# ✅ Check Helm
helm version
# Expected: version.BuildInfo{Version:"v3.x.x"}

# ✅ Check Kind
kind version
# Expected: kind v0.20.x or higher

# ✅ Check Node.js
node --version
# Expected: v18.x.x or higher

# ✅ Check Yarn
yarn --version
# Expected: 4.x.x
```

## 🔧 Step 1: Kubernetes Cluster Setup

### 1.1 Create Kind Cluster

```bash
# Create a new Kind cluster
kind create cluster --name kind --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

### 1.2 Install Nginx Ingress Controller

```bash
# Apply Nginx Ingress for Kind
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller to be ready
echo "⏳ Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Verify ingress is working
kubectl get pods -n ingress-nginx
```

## 🔄 Step 2: ArgoCD Installation

### 2.1 Install ArgoCD

```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
echo "📦 Installing ArgoCD..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods to be ready
echo "⏳ Waiting for ArgoCD to be ready (this may take a few minutes)..."
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Verify ArgoCD installation
kubectl get pods -n argocd
```

### 2.2 Configure ArgoCD Access

```bash
# Get initial admin password
echo "🔑 Getting ArgoCD admin password..."
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "ArgoCD admin password: $ARGOCD_PASSWORD"

# Create ArgoCD ingress
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  ingressClassName: nginx
  rules:
  - host: argocd.test.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
EOF

# Start port-forward for immediate access
echo "🚀 Starting ArgoCD port-forward..."
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
ARGOCD_PF_PID=$!
echo "ArgoCD available at: http://localhost:8080"
echo "Username: admin"
echo "Password: $ARGOCD_PASSWORD"
```

## 📊 Step 3: Monitoring Stack Installation

### 3.1 Add Helm Repository

```bash
# Add Prometheus community Helm repository
echo "📦 Adding Prometheus Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Verify repository is added
helm repo list | grep prometheus-community
```

### 3.2 Install Monitoring Stack

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Install kube-prometheus-stack
echo "📊 Installing Prometheus and Grafana stack..."
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword="admin123" \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage="5Gi" \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size="2Gi" \
  --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage="1Gi" \
  --timeout=600s

# Wait for monitoring stack to be ready
echo "⏳ Waiting for monitoring stack to be ready..."
kubectl wait --for=condition=Ready pods -l "release=kube-prometheus-stack" -n monitoring --timeout=300s

# Verify monitoring installation
kubectl get pods -n monitoring
```

### 3.3 Configure Monitoring Access

```bash
# Create monitoring ingress
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: monitoring
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - host: grafana.test.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kube-prometheus-stack-grafana
            port:
              number: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prometheus-ingress
  namespace: monitoring
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - host: prometheus.test.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kube-prometheus-stack-prometheus
            port:
              number: 9090
EOF

# Start port-forwards for immediate access
echo "🚀 Starting monitoring port-forwards..."
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3010:80 > /dev/null 2>&1 &
GRAFANA_PF_PID=$!

kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090 > /dev/null 2>&1 &
PROMETHEUS_PF_PID=$!

echo "Grafana available at: http://localhost:3010"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "Prometheus available at: http://localhost:9090"
```

## 🏠 Step 4: Host Configuration

```bash
# Add entries to /etc/hosts
echo "🌐 Configuring local DNS..."
if ! grep -q "argocd.test.com" /etc/hosts; then
    echo "127.0.0.1 argocd.test.com" | sudo tee -a /etc/hosts
fi

if ! grep -q "grafana.test.com" /etc/hosts; then
    echo "127.0.0.1 grafana.test.com" | sudo tee -a /etc/hosts
fi

if ! grep -q "prometheus.test.com" /etc/hosts; then
    echo "127.0.0.1 prometheus.test.com" | sudo tee -a /etc/hosts
fi

echo "✅ Host configuration complete!"
echo "You can now access services via:"
echo "  - ArgoCD: http://argocd.test.com"
echo "  - Grafana: http://grafana.test.com"
echo "  - Prometheus: http://prometheus.test.com"
```

## 🚪 Step 5: Backstage Setup

### 5.1 Clone and Setup Repository

```bash
# Navigate to your development directory
cd ~/Development  # Adjust path as needed

# Clone the repository (adjust URL as needed)
git clone https://github.com/your-username/backstage-app-devc.git
cd backstage-app-devc/backstage

# Install dependencies
echo "📦 Installing Backstage dependencies..."
yarn install --frozen-lockfile
```

### 5.2 Configure Environment

```bash
# Create environment configuration
cat <<EOF > .env
# Backstage Environment Variables
NODE_ENV=development

# GitHub Integration (replace with your tokens)
GITHUB_TOKEN=your_github_token_here
AUTH_GITHUB_CLIENT_ID=your_oauth_client_id
AUTH_GITHUB_CLIENT_SECRET=your_oauth_client_secret

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=backstage
POSTGRES_PASSWORD=backstage_password
POSTGRES_DB=backstage
POSTGRES_SSL_ENABLED=false

# Backend Secret for Service-to-Service Auth
BACKEND_SECRET=$(openssl rand -hex 32)

# ArgoCD Integration (via Ingress)
REACT_APP_ARGOCD_URL=http://argocd.test.com
REACT_APP_ARGOCD_USERNAME=admin
REACT_APP_ARGOCD_PASSWORD=$ARGOCD_PASSWORD

# Kubernetes Integration
REACT_APP_KUBERNETES_URL=http://localhost:8001
CLUSTER_NAME=kind-kind

# Monitoring Integration (via Ingress)
REACT_APP_PROMETHEUS_URL=http://prometheus.test.com
REACT_APP_GRAFANA_URL=http://grafana.test.com
REACT_APP_GRAFANA_USERNAME=admin
REACT_APP_GRAFANA_PASSWORD=admin123

# Fallback URLs (port-forwards)
REACT_APP_PROMETHEUS_URL_LOCAL=http://localhost:9090
REACT_APP_GRAFANA_URL_LOCAL=http://localhost:3010
EOF

echo "⚙️ Environment configuration created!"
echo "📝 Please edit .env file and add your GitHub tokens:"
echo "   - GITHUB_TOKEN: Personal access token"
echo "   - AUTH_GITHUB_CLIENT_ID: OAuth app client ID"
echo "   - AUTH_GITHUB_CLIENT_SECRET: OAuth app client secret"
```

### 5.3 Start Kubernetes Proxy

```bash
# Start kubectl proxy for Kubernetes API access
echo "🚀 Starting Kubernetes API proxy..."
kubectl proxy --port=8001 > /dev/null 2>&1 &
K8S_PROXY_PID=$!
echo "Kubernetes API available at: http://localhost:8001"
```

### 5.4 Start Backstage

```bash
# Start Backstage development server
echo "🚀 Starting Backstage..."
echo "This will take a few minutes for the first run..."
yarn dev
```

## 🔗 Step 6: Create ArgoCD Applications

### 6.1 Create Application Manifests

```bash
# Create ArgoCD applications directory
mkdir -p kubernetes/argocd-apps

# Create monitoring stack application
cat <<EOF > kubernetes/argocd-apps/monitoring-stack.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring-stack
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://prometheus-community.github.io/helm-charts
    chart: kube-prometheus-stack
    targetRevision: "*.*.x"
    helm:
      values: |
        grafana:
          adminPassword: admin123
          persistence:
            enabled: true
            size: 2Gi
        prometheus:
          prometheusSpec:
            storageSpec:
              volumeClaimTemplate:
                spec:
                  resources:
                    requests:
                      storage: 5Gi
            retention: 15d
        alertmanager:
          alertmanagerSpec:
            storage:
              volumeClaimTemplate:
                spec:
                  resources:
                    requests:
                      storage: 1Gi
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
EOF

# Apply ArgoCD applications
kubectl apply -f kubernetes/argocd-apps/
```

## ✅ Step 7: Verification

### 7.1 Check All Services

```bash
echo "🔍 Verifying all services..."

# Check Kubernetes cluster
echo "Kubernetes cluster:"
kubectl get nodes
echo ""

# Check ArgoCD
echo "ArgoCD status:"
kubectl get pods -n argocd | grep Running
echo ""

# Check Monitoring
echo "Monitoring stack:"
kubectl get pods -n monitoring | grep Running
echo ""

# Check Ingress
echo "Ingress rules:"
kubectl get ingress --all-namespaces
echo ""
```

### 7.2 Test Access URLs

```bash
echo "🌐 Testing service access..."

# Test ArgoCD (may take a moment to respond)
if curl -k -s http://argocd.test.com > /dev/null; then
    echo "✅ ArgoCD ingress working"
else
    echo "❌ ArgoCD ingress not responding (try port-forward: http://localhost:8080)"
fi

# Test Grafana
if curl -s http://grafana.test.com > /dev/null; then
    echo "✅ Grafana ingress working"
else
    echo "❌ Grafana ingress not responding (try port-forward: http://localhost:3010)"
fi

# Test Prometheus
if curl -s http://prometheus.test.com > /dev/null; then
    echo "✅ Prometheus ingress working"
else
    echo "❌ Prometheus ingress not responding (try port-forward: http://localhost:9090)"
fi

# Test Kubernetes API proxy
if curl -s http://localhost:8001/api/v1/namespaces > /dev/null; then
    echo "✅ Kubernetes API proxy working"
else
    echo "❌ Kubernetes API proxy not responding"
fi
```

## 🎉 Step 8: Final Setup Summary

```bash
cat <<EOF

🎉 SETUP COMPLETE!

Your Backstage DevOps Platform is now ready:

📊 SERVICES AVAILABLE:
┌──────────────┬─────────────────────────┬─────────────────────────┬─────────────────┐
│ Service      │ Ingress URL             │ Port Forward URL        │ Credentials     │
├──────────────┼─────────────────────────┼─────────────────────────┼─────────────────┤
│ Backstage    │ N/A                     │ http://localhost:3001   │ GitHub OAuth    │
│ ArgoCD       │ http://argocd.test.com  │ http://localhost:8080   │ admin/$ARGOCD_PASSWORD │
│ Grafana      │ http://grafana.test.com │ http://localhost:3010   │ admin/admin123  │
│ Prometheus   │ http://prometheus.test.com │ http://localhost:9090 │ No auth         │
│ K8s API      │ N/A                     │ http://localhost:8001   │ Service account │
└──────────────┴─────────────────────────┴─────────────────────────┴─────────────────┘

🚀 NEXT STEPS:
1. Open Backstage: http://localhost:3001
2. Login with GitHub OAuth
3. Explore the Kubernetes dashboard (real data!)
4. Check ArgoCD applications
5. View Grafana dashboards
6. Monitor Prometheus metrics

📚 DOCUMENTATION:
- Complete Platform Guide: docs/COMPLETE_PLATFORM_DOCUMENTATION.md
- Architecture Overview: docs/ARCHITECTURE.md
- Troubleshooting: docs/troubleshooting/

🔧 USEFUL COMMANDS:
- Restart port-forwards: ./scripts/restart-port-forwards.sh
- Check cluster status: kubectl get pods --all-namespaces
- View logs: kubectl logs -f deployment/name -n namespace
- Restart Backstage: yarn dev (in backstage directory)

EOF
```

## 🛟 Troubleshooting Quick Fixes

### If Services Don't Start:

```bash
# Restart port-forwards
pkill -f "port-forward"
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3010:80 &
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090 &
kubectl proxy --port=8001 &
```

### If Ingress Doesn't Work:

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Restart ingress controller if needed
kubectl rollout restart deployment/ingress-nginx-controller -n ingress-nginx

# Verify /etc/hosts
cat /etc/hosts | grep test.com
```

### If Backstage Shows Mock Data:

```bash
# Check environment variables
cat .env | grep REACT_APP

# Verify port-forwards are running
ps aux | grep "port-forward"

# Test API endpoints
curl http://localhost:8001/api/v1/namespaces
curl http://localhost:8080/api/version
```

---

**🎯 You now have a fully functional DevOps platform with real-time monitoring, GitOps, and a beautiful developer portal!**