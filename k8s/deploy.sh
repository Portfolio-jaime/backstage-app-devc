#!/bin/bash

# Backstage Kubernetes Deployment Script
# British Airways - DevOps Platform
# Author: Jaime Henao

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="backstage"
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
CLUSTER_NAME="${CLUSTER_NAME:-ba-devops-eks}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed or not in PATH"
        exit 1
    fi
    
    # Check if connected to correct cluster
    CURRENT_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "none")
    if [[ "$CURRENT_CONTEXT" != *"$CLUSTER_NAME"* ]]; then
        log_warn "Current kubectl context: $CURRENT_CONTEXT"
        log_warn "Expected cluster: $CLUSTER_NAME"
        read -p "Continue anyway? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Prerequisites check completed"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace $NAMESPACE..."
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_warn "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f namespace.yaml
        log_success "Namespace $NAMESPACE created"
    fi
}

# Create secrets
create_secrets() {
    log_info "Creating secrets..."
    
    # Check if secrets exist
    if kubectl get secret backstage-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warn "Secret backstage-secrets already exists"
        read -p "Do you want to update it? (y/N): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kubectl delete secret backstage-secrets -n "$NAMESPACE"
            kubectl apply -f secrets.yaml
            log_success "Secret backstage-secrets updated"
        fi
    else
        kubectl apply -f secrets.yaml
        log_success "Secrets created"
    fi
}

# Create configmaps
create_configmaps() {
    log_info "Creating configmaps..."
    
    # Create app config configmap from the kubernetes config file
    if [[ -f "../app-config.kubernetes.yaml" ]]; then
        kubectl create configmap backstage-app-config \
            --from-file=app-config.kubernetes.yaml=../app-config.kubernetes.yaml \
            -n "$NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -
        log_success "App config configmap created/updated"
    else
        log_error "app-config.kubernetes.yaml not found"
        exit 1
    fi
    
    # Apply other configmaps
    kubectl apply -f configmap.yaml
    log_success "ConfigMaps created"
}

# Create RBAC
create_rbac() {
    log_info "Creating RBAC resources..."
    kubectl apply -f rbac.yaml
    log_success "RBAC resources created"
}

# Deploy application
deploy_app() {
    log_info "Deploying Backstage application..."
    
    # Apply deployment
    kubectl apply -f deployment.yaml
    
    # Wait for rollout
    kubectl rollout status deployment/backstage -n "$NAMESPACE" --timeout=300s
    log_success "Deployment completed"
}

# Create services
create_services() {
    log_info "Creating services..."
    kubectl apply -f service.yaml
    log_success "Services created"
}

# Create ingress
create_ingress() {
    log_info "Creating ingress..."
    
    # Check if cert-manager is available for TLS
    if kubectl get crd certificates.cert-manager.io &> /dev/null; then
        log_info "cert-manager detected, TLS certificates will be managed automatically"
    else
        log_warn "cert-manager not found, you'll need to manage TLS certificates manually"
    fi
    
    kubectl apply -f ingress.yaml
    log_success "Ingress created"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Check if Prometheus operator is installed
    if kubectl get crd servicemonitors.monitoring.coreos.com &> /dev/null; then
        kubectl apply -f monitoring.yaml
        log_success "Monitoring resources created"
    else
        log_warn "Prometheus operator not found, skipping monitoring setup"
        log_info "To enable monitoring, install Prometheus operator first"
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=backstage -n "$NAMESPACE" --timeout=300s
    
    # Check if service is accessible
    BACKSTAGE_URL=$(kubectl get ingress backstage-ingress -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [[ -n "$BACKSTAGE_URL" ]]; then
        log_info "Backstage should be accessible at: https://$BACKSTAGE_URL"
    else
        # Try to get service endpoint
        EXTERNAL_IP=$(kubectl get svc backstage -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
        if [[ -n "$EXTERNAL_IP" ]]; then
            log_info "Backstage service external IP: $EXTERNAL_IP"
        else
            log_info "Use port-forward to access: kubectl port-forward svc/backstage 8080:80 -n $NAMESPACE"
        fi
    fi
    
    log_success "Health check completed"
}

# Display status
display_status() {
    log_info "Deployment status:"
    echo
    kubectl get pods,svc,ingress -n "$NAMESPACE"
    echo
    log_info "To check logs: kubectl logs -f deployment/backstage -n $NAMESPACE"
    log_info "To scale: kubectl scale deployment backstage --replicas=<count> -n $NAMESPACE"
}

# Cleanup function
cleanup() {
    log_warn "Cleaning up Backstage deployment..."
    
    read -p "Are you sure you want to delete everything? This cannot be undone! (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleanup cancelled"
        exit 0
    fi
    
    kubectl delete -f monitoring.yaml 2>/dev/null || true
    kubectl delete -f ingress.yaml 2>/dev/null || true
    kubectl delete -f service.yaml 2>/dev/null || true
    kubectl delete -f deployment.yaml 2>/dev/null || true
    kubectl delete -f rbac.yaml 2>/dev/null || true
    kubectl delete -f configmap.yaml 2>/dev/null || true
    kubectl delete configmap backstage-app-config -n "$NAMESPACE" 2>/dev/null || true
    kubectl delete -f secrets.yaml 2>/dev/null || true
    kubectl delete -f namespace.yaml 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            log_info "Starting Backstage deployment to Kubernetes..."
            check_prerequisites
            create_namespace
            create_secrets
            create_configmaps
            create_rbac
            deploy_app
            create_services
            create_ingress
            setup_monitoring
            health_check
            display_status
            log_success "Backstage deployment completed successfully!"
            ;;
        "update")
            log_info "Updating Backstage deployment..."
            check_prerequisites
            create_configmaps
            deploy_app
            health_check
            log_success "Backstage update completed!"
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            display_status
            ;;
        "logs")
            kubectl logs -f deployment/backstage -n "$NAMESPACE"
            ;;
        *)
            echo "Usage: $0 {deploy|update|cleanup|status|logs}"
            echo
            echo "Commands:"
            echo "  deploy   - Full deployment (default)"
            echo "  update   - Update existing deployment"
            echo "  cleanup  - Remove all resources"
            echo "  status   - Show deployment status"
            echo "  logs     - Follow application logs"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"