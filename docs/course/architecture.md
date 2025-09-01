# Backstage Architecture Overview

## 🏗️ High-Level Architecture

Backstage follows a plugin-based architecture with clear separation between frontend and backend components.

```mermaid
graph TB
    subgraph "Frontend (React)"
        UI[User Interface]
        ROUTER[App Router]
        PLUGINS_FE[Frontend Plugins]
        CATALOG_FE[Catalog UI]
        SCAFFOLDER_FE[Scaffolder UI]
        TECHDOCS_FE[TechDocs UI]
    end
    
    subgraph "Backend (Node.js)"
        API[API Gateway]
        PLUGINS_BE[Backend Plugins]
        CATALOG_BE[Catalog Backend]
        SCAFFOLDER_BE[Scaffolder Backend]
        TECHDOCS_BE[TechDocs Backend]
        AUTH[Auth Service]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        CACHE[(Redis Cache)]
        FILES[File Storage]
    end
    
    subgraph "External Integrations"
        GITHUB[GitHub API]
        K8S[Kubernetes API]
        CI[CI/CD Systems]
        METRICS[Monitoring]
    end
    
    UI --> ROUTER
    ROUTER --> PLUGINS_FE
    PLUGINS_FE --> CATALOG_FE
    PLUGINS_FE --> SCAFFOLDER_FE
    PLUGINS_FE --> TECHDOCS_FE
    
    PLUGINS_FE --> API
    API --> PLUGINS_BE
    PLUGINS_BE --> CATALOG_BE
    PLUGINS_BE --> SCAFFOLDER_BE
    PLUGINS_BE --> TECHDOCS_BE
    API --> AUTH
    
    PLUGINS_BE --> DB
    PLUGINS_BE --> CACHE
    PLUGINS_BE --> FILES
    
    PLUGINS_BE --> GITHUB
    PLUGINS_BE --> K8S
    PLUGINS_BE --> CI
    PLUGINS_BE --> METRICS
```

## 🔧 Core Components

### Frontend Components

#### App Shell
- **Purpose**: Main application framework
- **Technology**: React 18+ with TypeScript
- **Responsibilities**:
  - Routing and navigation
  - Theme management
  - Plugin orchestration
  - Authentication state

#### Catalog Frontend
- **Purpose**: Service and component discovery
- **Features**:
  - Entity browsing and search
  - Dependency visualization
  - Ownership tracking
  - API documentation

#### Scaffolder Frontend  
- **Purpose**: Software template execution
- **Features**:
  - Template selection
  - Parameter input forms
  - Execution progress tracking
  - Repository creation

#### TechDocs Frontend
- **Purpose**: Documentation site
- **Features**:
  - Markdown rendering
  - Search functionality
  - Navigation menus
  - Asset management

### Backend Components

#### API Gateway
- **Purpose**: Request routing and middleware
- **Features**:
  - Authentication validation
  - Rate limiting
  - CORS handling
  - Request logging

#### Catalog Backend
- **Purpose**: Entity management and ingestion
- **Features**:
  - Entity processing
  - Location discovery
  - Validation rules
  - Change tracking

#### Scaffolder Backend
- **Purpose**: Template execution engine
- **Features**:
  - Action execution
  - Git operations
  - File manipulation
  - Webhook handling

#### Auth Service
- **Purpose**: Authentication and authorization
- **Supported Providers**:
  - GitHub OAuth
  - Google OAuth  
  - Microsoft Azure AD
  - Auth0
  - Custom OIDC

## 🗄️ Data Architecture

### Entity Model

```mermaid
erDiagram
    ENTITY {
        string apiVersion
        string kind
        object metadata
        object spec
        object status
    }
    
    COMPONENT ||--|| ENTITY : extends
    COMPONENT {
        string type
        string lifecycle
        string owner
        string system
    }
    
    API ||--|| ENTITY : extends
    API {
        string type
        string lifecycle
        string owner
        string system
    }
    
    SYSTEM ||--|| ENTITY : extends
    SYSTEM {
        string owner
        string domain
    }
    
    USER ||--|| ENTITY : extends
    USER {
        string profile
        array memberOf
    }
    
    GROUP ||--|| ENTITY : extends
    GROUP {
        string type
        array members
        string parent
    }
```

### Database Schema

#### Core Tables
- **entities**: Main entity storage
- **entity_relations**: Relationships between entities  
- **locations**: Source locations for entities
- **refresh_state**: Entity refresh tracking

#### Plugin Tables
- **scaffolder_tasks**: Template execution history
- **search_index**: Full-text search index
- **permission_metadata**: Authorization metadata

## 🔌 Plugin Architecture

### Plugin Types

#### Frontend Plugins
```typescript
// Example plugin structure
export const plugin = createPlugin({
  id: 'my-plugin',
  routes: {
    root: rootRouteRef,
  },
  externalRoutes: {
    catalogEntity: catalogRouteRef,
  },
});
```

#### Backend Plugins
```typescript
// Example backend plugin
export async function createPlugin(): Promise<BackendFeature> {
  return createBackendPlugin({
    pluginId: 'my-plugin',
    register(env) {
      env.registerInit({
        deps: {
          httpRouter: coreServices.httpRouter,
          logger: coreServices.logger,
        },
        async init({ httpRouter, logger }) {
          // Plugin initialization
        },
      });
    },
  });
}
```

### Plugin Communication

```mermaid
sequenceDiagram
    participant FE as Frontend Plugin
    participant BE as Backend Plugin
    participant DB as Database
    participant EXT as External API
    
    FE->>BE: HTTP Request
    BE->>DB: Query Data
    DB-->>BE: Return Results
    BE->>EXT: External API Call
    EXT-->>BE: API Response
    BE-->>FE: JSON Response
    FE->>FE: Update UI
```

## 🚦 Request Flow

### Catalog Entity Request

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Gateway
    participant CAT as Catalog Backend
    participant DB as Database
    
    U->>FE: Browse Catalog
    FE->>API: GET /api/catalog/entities
    API->>API: Validate Auth Token
    API->>CAT: Forward Request
    CAT->>DB: Query Entities
    DB-->>CAT: Return Results
    CAT->>CAT: Apply Filters
    CAT-->>API: Entity List
    API-->>FE: JSON Response
    FE->>FE: Render Entity Cards
    FE-->>U: Display Catalog
```

### Template Scaffolding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Scaffolder UI
    participant API as API Gateway
    participant SC as Scaffolder Backend
    participant GH as GitHub API
    
    U->>FE: Fill Template Form
    FE->>API: POST /api/scaffolder/v2/tasks
    API->>SC: Create Task
    SC->>SC: Validate Parameters
    SC->>GH: Create Repository
    GH-->>SC: Repository Created
    SC->>GH: Commit Initial Files
    GH-->>SC: Files Committed
    SC-->>API: Task Complete
    API-->>FE: Success Response
    FE-->>U: Show Success
```

## 🔐 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant AUTH as Auth Service
    participant GH as GitHub OAuth
    
    U->>FE: Click Sign In
    FE->>AUTH: /auth/github
    AUTH->>GH: OAuth Authorization
    GH-->>AUTH: Authorization Code
    AUTH->>GH: Exchange for Token
    GH-->>AUTH: Access Token
    AUTH->>AUTH: Create Session
    AUTH-->>FE: Redirect with Session
    FE-->>U: Authenticated View
```

### Authorization Model

- **Role-Based Access Control (RBAC)**
- **Resource-Based Permissions**
- **Policy Engine Integration**
- **Audit Logging**

## 📊 Monitoring & Observability

### Metrics Collection

```mermaid
graph LR
    BACKSTAGE[Backstage App] --> PROM[Prometheus]
    PROM --> GRAFANA[Grafana]
    BACKSTAGE --> LOGS[Log Aggregation]
    LOGS --> ELK[ELK Stack]
    BACKSTAGE --> TRACES[Distributed Tracing]
    TRACES --> JAEGER[Jaeger]
```

### Key Metrics

- **Request Rate**: Requests per second
- **Response Time**: 95th percentile latency
- **Error Rate**: 4xx/5xx error percentage
- **Database Connections**: Active connection count
- **Memory Usage**: Heap and RSS memory
- **CPU Utilization**: Process CPU usage

## 🔄 Deployment Patterns

### Development Environment
- **Local**: Docker Compose setup
- **Hot Reload**: Webpack dev server
- **Database**: SQLite for simplicity

### Production Environment
- **Container**: Docker with multi-stage builds  
- **Orchestration**: Kubernetes deployment
- **Database**: PostgreSQL with replication
- **Load Balancing**: Ingress controller
- **Monitoring**: Prometheus + Grafana stack

---

**Next**: [Core Components Deep Dive](./components.md)