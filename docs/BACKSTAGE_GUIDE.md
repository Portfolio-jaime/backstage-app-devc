# 🎭 Backstage Configuration Guide

## Overview

This guide covers the complete Backstage configuration for the DevOps Course, including all plugins, integrations, and customizations specific to British Airways training environment.

## Configuration Files Structure

```
backstage/
├── app-config.yaml              # Main configuration
├── app-config.local.yaml        # Local development overrides
├── app-config.production.yaml   # Production configuration
├── .env                        # Environment variables
├── package.json               # Dependencies and scripts
├── packages/
│   ├── app/                   # Frontend React application
│   └── backend/               # Node.js backend server
├── catalog/                   # Entity definitions
├── plugins/                   # Custom plugins
└── examples/                  # Sample templates and entities
```

## Main Configuration (`app-config.yaml`)

### Application Settings
```yaml
app:
  title: Backstage DevOps Course - BA Training
  baseUrl: http://localhost:3001
  support:
    url: https://github.com/jaime-henao/backstage-course
    items:
      - title: Course Documentation
        icon: docs
        links:
          - url: http://localhost:3001/docs/default/system/course/
            title: Course Overview
      - title: Troubleshooting
        icon: alert
        links:
          - url: http://localhost:3001/docs/default/system/troubleshooting/
            title: Common Issues

organization:
  name: British Airways - DevOps Training
```

### Backend Configuration
```yaml
backend:
  auth:
    keys:
      - secret: ${BACKEND_SECRET}
  baseUrl: http://localhost:7008
  listen:
    port: 7008
    # host: 127.0.0.1  # Uncomment to bind to specific interface
  
  # Content Security Policy
  csp:
    connect-src: ["'self'", 'http:', 'https:']
  
  # Cross-Origin Resource Sharing
  cors:
    origin: http://localhost:3001
    methods: [GET, HEAD, PATCH, POST, PUT, DELETE]
    credentials: true
  
  # Database Configuration
  database:
    client: pg
    connection:
      host: ${POSTGRES_HOST}
      port: ${POSTGRES_PORT}
      user: ${POSTGRES_USER}
      password: ${POSTGRES_PASSWORD}
      database: ${POSTGRES_DB}
      ssl: false  # Disabled for local development
```

### GitHub Integration
```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
    # GitHub Enterprise Server (if needed for BA internal repos)
    # - host: github.ba.com
    #   apiBaseUrl: https://github.ba.com/api/v3
    #   token: ${GHE_TOKEN}
```

### Authentication Configuration
```yaml
auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityName
            - resolver: emailLocalPartMatchingUserEntityName
```

### Catalog Configuration
```yaml
catalog:
  import:
    entityFilename: catalog-info.yaml
    pullRequestBranchName: backstage-integration
  
  rules:
    - allow: [Component, System, API, Resource, Location, Template, User, Group, Domain]
  
  # GitHub entity providers for automatic discovery
  providers:
    github:
      courseProvider:
        organization: 'jaime-henao'
        catalogPath: '/catalog-info.yaml'
        filters:
          branch: 'main'
          repository: '.*backstage.*'
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
          initialDelay: { seconds: 15 }
  
  locations:
    # Course-specific entities
    - type: file
      target: ../../examples/entities.yaml
    
    # Course software templates
    - type: file
      target: ../../examples/template/template.yaml
      rules:
        - allow: [Template]
    
    # Course organizational data
    - type: file
      target: ../../examples/org.yaml
      rules:
        - allow: [User, Group]
    
    # External example data
    - type: url
      target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/all.yaml
      rules:
        - allow: [Component, API, Resource]
```

### TechDocs Configuration
```yaml
techdocs:
  builder: 'local'
  generator:
    runIn: 'docker'
  publisher:
    type: 'local'
```

### Scaffolder Configuration
```yaml
scaffolder:
  # Default branch for created repositories
  defaultBranch: main
  # Default author for commits
  defaultCommitMessage: 'Initial commit from Backstage'
```

## Local Development Configuration (`app-config.local.yaml`)

```yaml
app:
  listen:
    host: 0.0.0.0  # Allow external connections

auth:
  environment: development
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName

catalog:
  rules:
    - allow: [Component, System, API, Resource, Location]
  locations:
    # Local entity definitions
    - type: file
      target: /app/backstage/catalog/entities/users.yaml
      rules:
        - allow: [User]
    - type: file
      target: /app/backstage/catalog/entities/groups.yaml
      rules:
        - allow: [Group]

techdocs:
  builder: 'local'
  publisher:
    type: 'local'
  generator:
    runIn: local
```

## Environment Variables (`.env`)

```bash
# Environment
NODE_ENV=development

# GitHub Integration
GITHUB_TOKEN=ghp_your_github_personal_access_token
AUTH_GITHUB_CLIENT_ID=Ov23liLt4lvmXKl8nS8M
AUTH_GITHUB_CLIENT_SECRET=1718e24d1dadccb7507c4dd1aba4138074c09b7c

# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=backstage
POSTGRES_PASSWORD=backstage_password
POSTGRES_DB=backstage

# Backend Secret for Service-to-Service Auth
BACKEND_SECRET=6846426d55b31c8bd355fa53a22ec75b0d966ac6e415678d6f2967815490e106

# Logging
LOG_LEVEL=info
```

## Plugin Configuration

### Installed Plugins

#### Core Plugins
```json
{
  "@backstage/plugin-catalog": "Catalog management",
  "@backstage/plugin-catalog-react": "Catalog UI components",
  "@backstage/plugin-scaffolder": "Software templates",
  "@backstage/plugin-techdocs": "Documentation site generator",
  "@backstage/plugin-auth-backend": "Authentication service",
  "@backstage/plugin-search": "Full-text search"
}
```

#### GitHub Integration Plugins
```json
{
  "@backstage/plugin-catalog-backend-module-github": "GitHub entity discovery",
  "@backstage/plugin-github-actions": "GitHub Actions integration",
  "@backstage/plugin-github-pull-requests-board": "PR management"
}
```

#### Kubernetes Plugins
```json
{
  "@backstage/plugin-kubernetes": "K8s resource visualization",
  "@backstage/plugin-kubernetes-backend": "K8s backend service"
}
```

### Plugin Configuration Details

#### Catalog Plugin
```yaml
# Backend configuration
catalog:
  processors:
    githubApi:
      privateToken: ${GITHUB_TOKEN}
    githubOrg:
      providers:
        - target: https://github.com
          token: ${GITHUB_TOKEN}
```

#### Scaffolder Plugin
```yaml
scaffolder:
  actions:
    - id: 'github:repo:create'
      description: 'Create a GitHub repository'
    - id: 'github:repo:push'
      description: 'Push to GitHub repository'
    - id: 'catalog:register'
      description: 'Register in Backstage catalog'
```

#### TechDocs Plugin
```yaml
techdocs:
  requestUrl: http://localhost:7008/api/techdocs
  storageUrl: http://localhost:7008/api/techdocs/static/docs
```

#### Kubernetes Plugin
```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: https://kubernetes.default.svc
          name: local-cluster
          authProvider: 'serviceAccount'
```

## Software Templates

### Template Structure
```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: react-ssr-template
  title: React SSR Template
  description: Create a new React SSR application
  tags:
    - recommended
    - react
    - typescript
spec:
  owner: backstage/maintainers
  type: website
  parameters:
    - title: Fill in some steps
      required:
        - name
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the component
  steps:
    - id: template
      name: Fetch Skeleton + Template
      action: fetch:template
      input:
        url: ./skeleton
        copyWithoutRender:
          - .github/workflows/*
        values:
          component_id: ${{ parameters.name }}
    
    - id: publish
      name: Publish
      action: publish:github
      input:
        description: This is ${{ parameters.name }}
        repoUrl: ${{ parameters.repoUrl }}
    
    - id: register
      name: Register
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'
```

## Entity Definitions

### Component Entity
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-service
  description: Example microservice for the course
  annotations:
    github.com/project-slug: jaime-henao/example-service
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  lifecycle: production
  owner: platform-team
  system: course-system
  providesApis:
    - example-api
  consumesApis:
    - user-api
  dependsOn:
    - resource:example-database
```

### System Entity
```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: course-system
  description: Backstage course demonstration system
spec:
  owner: platform-team
  domain: training
```

### API Entity
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: example-api
  description: Example API for the course
spec:
  type: openapi
  lifecycle: production
  owner: platform-team
  system: course-system
  definition:
    $text: https://github.com/jaime-henao/example-service/blob/main/api-spec.yaml
```

## Advanced Configuration

### Custom Theme
```typescript
// packages/app/src/theme.ts
import { createTheme, lightTheme } from '@backstage/theme';

export const baTheme = createTheme({
  palette: {
    ...lightTheme.palette,
    primary: {
      main: '#1f5582', // BA Blue
    },
    secondary: {
      main: '#e31837', // BA Red
    },
  },
});
```

### Custom Plugin Integration
```typescript
// packages/app/src/App.tsx
import { customPlugin } from '../plugins/custom';

const app = createApp({
  plugins: [
    ...defaultPlugins,
    customPlugin,
  ],
});
```

### Database Schema Customization
```sql
-- Custom tables for course-specific data
CREATE TABLE course_progress (
  user_id VARCHAR(255) PRIMARY KEY,
  completed_modules JSON,
  current_module VARCHAR(255),
  completion_date TIMESTAMP
);

CREATE TABLE course_feedback (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  module_name VARCHAR(255),
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Performance Optimization

### Caching Configuration
```yaml
backend:
  cache:
    store: memory
    connection:
      ttl: 3600 # 1 hour
```

### Database Optimization
```yaml
backend:
  database:
    connection:
      pool:
        min: 2
        max: 10
        acquireTimeoutMillis: 30000
        createTimeoutMillis: 30000
        destroyTimeoutMillis: 5000
        idleTimeoutMillis: 30000
        reapIntervalMillis: 1000
        createRetryIntervalMillis: 200
```

## Security Configuration

### Content Security Policy
```yaml
backend:
  csp:
    connect-src:
      - "'self'"
      - 'http:'
      - 'https:'
      - 'data:'
    img-src:
      - "'self'"
      - 'data:'
      - 'https://avatars.githubusercontent.com'
```

### CORS Configuration
```yaml
backend:
  cors:
    origin:
      - http://localhost:3001
      - https://your-domain.com
    credentials: true
    methods:
      - GET
      - POST
      - PUT
      - DELETE
      - PATCH
      - OPTIONS
```

## Monitoring and Logging

### Logging Configuration
```yaml
backend:
  logger:
    level: info
    format: json
    redactionKeys:
      - password
      - token
      - secret
```

### Metrics Collection
```yaml
backend:
  metrics:
    enabled: true
    port: 7009
    path: /metrics
```

## Troubleshooting

### Common Configuration Issues

#### 1. Plugin Not Loading
```bash
# Check plugin registration
grep -r "plugin-name" packages/

# Verify dependencies
yarn why @backstage/plugin-name
```

#### 2. Authentication Issues
```bash
# Verify environment variables
echo $AUTH_GITHUB_CLIENT_ID
echo $AUTH_GITHUB_CLIENT_SECRET

# Check GitHub OAuth app settings
# - Homepage URL: http://localhost:3001
# - Callback URL: http://localhost:7008/api/auth/github/handler/frame
```

#### 3. Database Connection Issues
```bash
# Test database connection
docker exec -it backstage-postgres psql -U backstage -d backstage -c "SELECT version();"

# Check environment variables
echo $POSTGRES_HOST
echo $POSTGRES_PORT
```

### Debug Commands
```bash
# Enable debug logging
LOG_LEVEL=debug yarn start

# Check configuration loading
yarn backstage-cli config:check

# Validate catalog entities
yarn backstage-cli catalog:validate
```

## Best Practices

### 1. Configuration Management
- Use environment variables for secrets
- Version control configuration files
- Document configuration changes

### 2. Security
- Rotate secrets regularly
- Use least privilege access
- Enable audit logging

### 3. Performance
- Optimize database queries
- Implement caching strategies
- Monitor resource usage

### 4. Maintenance
- Keep plugins updated
- Regular configuration reviews
- Monitor error logs

---

**Guide Version**: 1.0  
**Last Updated**: September 2024  
**Created by**: Jaime Henao - DevOps Engineer, British Airways