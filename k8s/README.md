# Backstage Kubernetes Deployment Guide
## British Airways DevOps Platform

This directory contains all necessary configuration files and scripts to deploy Backstage to a Kubernetes cluster in a production-ready manner.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │    Ingress      │    │   Backstage     │
│   (ALB/NLB)     │───▶│   Controller    │───▶│     Pods        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌──────▼─────────┐
                       │   PostgreSQL    │◀───│   ConfigMaps   │
                       │   (RDS/Managed) │    │   & Secrets    │
                       └─────────────────┘    └────────────────┘
                                                       │
                       ┌─────────────────┐    ┌──────▼─────────┐
                       │  AWS S3/GCS     │◀───│   TechDocs     │
                       │  (TechDocs)     │    │   Publisher    │
                       └─────────────────┘    └────────────────┘
```

## 📁 File Structure

```
k8s/
├── namespace.yaml          # Kubernetes namespace
├── secrets.yaml           # Secret configuration (DO NOT commit to git)
├── configmap.yaml         # Environment configuration
├── rbac.yaml              # Service account and permissions
├── deployment.yaml        # Main application deployment
├── service.yaml           # Kubernetes services
├── ingress.yaml           # Ingress configuration (ALB & NGINX)
├── monitoring.yaml        # Prometheus monitoring setup
├── deploy.sh              # Automated deployment script
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Kubernetes Cluster** (EKS, GKE, AKS, or on-premises)
2. **kubectl** configured to access your cluster
3. **AWS CLI** (for EKS deployments)
4. **PostgreSQL Database** (RDS or managed instance)
5. **Container Registry** (ECR, Docker Hub, etc.)

### Environment Variables Required

Create these secrets in your cluster or CI/CD system:

```bash
# Backend Authentication
BACKEND_SECRET="your-secure-backend-secret"

# Database Configuration
POSTGRES_HOST="your-postgres-host"
POSTGRES_PORT="5432"
POSTGRES_USER="backstage"
POSTGRES_PASSWORD="your-secure-password"
POSTGRES_DB="backstage"

# GitHub Integration
GITHUB_TOKEN="ghp_your-github-token"
AUTH_GITHUB_CLIENT_ID="your-github-oauth-app-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-oauth-secret"

# AWS Configuration (for TechDocs)
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="123456789012"
TECHDOCS_S3_BUCKET_NAME="your-techdocs-bucket"

# Kubernetes Clusters
K8S_PROD_CLUSTER_URL="https://your-eks-cluster.region.eks.amazonaws.com"
K8S_PROD_ASSUME_ROLE="arn:aws:iam::ACCOUNT:role/BackstageK8sRole"
```

### 1. Build and Push Container Image

```bash
# Build production image
cd ../backstage
docker build -f Dockerfile.production -t your-registry/backstage:latest .

# Push to registry
docker push your-registry/backstage:latest
```

### 2. Update Configuration

Edit the following files with your specific configuration:

- `secrets.yaml` - Add your actual secrets
- `deployment.yaml` - Update image repository
- `ingress.yaml` - Update hostname and certificate ARN
- `configmap.yaml` - Update environment-specific values

### 3. Deploy to Kubernetes

```bash
# Make deploy script executable
chmod +x deploy.sh

# Full deployment
./deploy.sh deploy

# Or deploy manually step by step
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f rbac.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f monitoring.yaml
```

## 🔧 Configuration Details

### Database Configuration

For production, use a managed PostgreSQL service:

- **AWS RDS**: Recommended for AWS deployments
- **Google Cloud SQL**: For GCP deployments
- **Azure Database**: For Azure deployments

Database features configured:
- SSL/TLS encryption
- Connection pooling (5-30 connections)
- Health checks
- Automatic failover support

### TechDocs Storage

Production configuration uses external storage:

- **AWS S3**: Primary recommendation
- **Google Cloud Storage**: Alternative option
- **Local**: Only for development

### Security Features

- Non-root container execution
- Read-only root filesystem
- Security contexts and capabilities
- Network policies (optional)
- Pod security standards compliance
- Secret management via Kubernetes secrets
- RBAC with least privilege access

### High Availability

- 3 replica deployment
- Pod anti-affinity rules
- Rolling update strategy
- Health checks (liveness/readiness)
- Resource limits and requests
- Horizontal Pod Autoscaling ready

## 📊 Monitoring and Observability

### Metrics

The deployment includes:

- Prometheus ServiceMonitor
- Custom alerts for error rates, response times
- Resource usage monitoring
- Database connection monitoring

### Dashboards

Pre-configured Grafana dashboard with:

- Request rate and error rate
- Response time percentiles
- Resource utilization
- Pod status and restarts

### Alerts

Built-in alerts for:

- High error rate (>5%)
- High response time (>1s)
- Pod restarts
- Database connectivity issues
- Resource exhaustion

## 🔐 Security Considerations

### Network Security

- Use private subnets for database
- Implement network policies
- Configure ingress with TLS termination
- Enable WAF on load balancer

### Authentication & Authorization

- GitHub OAuth integration
- RBAC for Kubernetes resources
- Azure AD integration (optional)
- Service-to-service authentication

### Data Protection

- Encrypt data at rest (database)
- Encrypt data in transit (TLS)
- Rotate secrets regularly
- Use managed identity services (IRSA, Workload Identity)

## 🚨 Troubleshooting

### Common Issues

1. **Pod CrashLoopBackOff**
   ```bash
   # Check pod logs
   kubectl logs -f deployment/backstage -n backstage
   
   # Check pod events
   kubectl describe pod -l app=backstage -n backstage
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connectivity
   kubectl exec -it deployment/backstage -n backstage -- nc -zv $POSTGRES_HOST $POSTGRES_PORT
   
   # Check database credentials
   kubectl get secret backstage-secrets -n backstage -o yaml
   ```

3. **Ingress Not Working**
   ```bash
   # Check ingress status
   kubectl get ingress -n backstage
   kubectl describe ingress backstage-ingress -n backstage
   
   # Check ingress controller logs
   kubectl logs -l app=nginx-ingress -n ingress-nginx
   ```

### Debug Commands

```bash
# Port forward for local access
kubectl port-forward svc/backstage 8080:80 -n backstage

# Execute shell in pod
kubectl exec -it deployment/backstage -n backstage -- /bin/sh

# View all resources
kubectl get all -n backstage

# Check resource usage
kubectl top pods -n backstage
```

## 🔄 Updates and Maintenance

### Rolling Updates

```bash
# Update deployment with new image
kubectl set image deployment/backstage backstage=your-registry/backstage:v1.2.3 -n backstage

# Check rollout status
kubectl rollout status deployment/backstage -n backstage

# Rollback if needed
kubectl rollout undo deployment/backstage -n backstage
```

### Backup Considerations

- Database: Use managed service backup features
- Configurations: Store in Git with GitOps
- Secrets: Use external secret management
- Persistent volumes: Regular snapshots

### Scaling

```bash
# Manual scaling
kubectl scale deployment backstage --replicas=5 -n backstage

# Auto-scaling (create HPA)
kubectl autoscale deployment backstage --cpu-percent=70 --min=3 --max=10 -n backstage
```

## 📋 Pre-deployment Checklist

- [ ] Container image built and pushed to registry
- [ ] Database created and accessible
- [ ] S3 bucket created for TechDocs
- [ ] GitHub OAuth app configured
- [ ] SSL/TLS certificates obtained
- [ ] DNS records configured
- [ ] Secrets updated with actual values
- [ ] Resource quotas and limits reviewed
- [ ] Monitoring and alerting configured
- [ ] Backup strategy in place

## 🆘 Support

For issues and support:

- **Internal BA Support**: [Create JIRA ticket](https://jira.ba.com/browse/DEVOPS)
- **Backstage Community**: [GitHub Discussions](https://github.com/backstage/backstage/discussions)
- **Documentation**: [Backstage.io](https://backstage.io/docs/)

---

**Maintained by**: DevOps Team - British Airways  
**Contact**: jaime.andres.henao.arbelaez@ba.com  
**Last Updated**: September 2025