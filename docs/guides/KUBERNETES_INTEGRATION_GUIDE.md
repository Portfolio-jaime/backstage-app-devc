# 🔧 Guía para Agregar Integración de Kubernetes a Componentes Existentes

## 📋 Checklist de Actividades

### ✅ **Paso 1: Identificar Componentes Existentes**

1. Ve al **Catalog** en Backstage (`http://localhost:3001`)
2. Lista todos los componentes existentes
3. Identifica cuáles están o deberían estar desplegados en Kubernetes

### ✅ **Paso 2: Para cada componente que esté en Kubernetes**

#### **2.1 Verificar en el cluster:**
```bash
# Listar todos los recursos
kubectl get all -A

# Buscar por nombre específico del componente
kubectl get all -A | grep "NOMBRE_COMPONENTE"

# Verificar en qué namespace está
kubectl get deployment NOMBRE_COMPONENTE -A
```

#### **2.2 Editar catalog-info.yaml:**

**Plantilla de anotaciones a agregar:**
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: NOMBRE_COMPONENTE
  description: Descripción del componente
  annotations:
    github.com/project-slug: Portfolio-jaime/NOMBRE_REPO
    backstage.io/techdocs-ref: dir:.
    # ⬇️ AGREGAR ESTAS ANOTACIONES ⬇️
    backstage.io/kubernetes-id: NOMBRE_COMPONENTE
    backstage.io/kubernetes-namespace: NAMESPACE_CORRECTO
  labels:
    environment: development  # o production
    language: python  # python, go, java, etc.
    deployment-type: kubernetes
  tags:
    - kubernetes
    - LENGUAJE  # python, golang, java, etc.
    - service
spec:
  type: service
  owner: EQUIPO_PROPIETARIO
  lifecycle: experimental
```

#### **2.3 Aplicar cambios:**
- **Opción A**: Editar directamente en GitHub y hacer commit
- **Opción B**: Editar localmente y push a GitHub
- **Opción C**: Usar el editor de Backstage (si está habilitado)

#### **2.4 Sincronizar en Backstage:**
- Ir al componente en el Catalog
- Hacer clic en "Refresh" o esperar sincronización automática
- Verificar que aparezca el tab "Kubernetes"

### ✅ **Paso 3: Verificar Integración**

#### **3.1 En Backstage:**
1. Ir al componente actualizado
2. Verificar que aparezca el tab **"Kubernetes"**
3. Verificar que no haya errores de conexión
4. Confirmar que muestre información de pods, deployments, etc.

#### **3.2 En el cluster:**
```bash
# Verificar que el recurso tenga las labels correctas
kubectl get deployment NOMBRE_COMPONENTE -o yaml | grep backstage

# Si no tiene las labels, agregarlas:
kubectl label deployment NOMBRE_COMPONENTE backstage.io/kubernetes-id=NOMBRE_COMPONENTE
kubectl label service NOMBRE_COMPONENTE backstage.io/kubernetes-id=NOMBRE_COMPONENTE
```

---

## 🛠️ Troubleshooting

### **Error: "FETCH_ERROR, message: request to https://127.0.0.1:54446 failed"**

#### **Causa:** Backstage en DevContainer no puede acceder al cluster kind en el host

#### **Solución para DevContainer:**

1. **Verificar el cluster actual:**
```bash
kubectl cluster-info
```

2. **Obtener la URL del cluster:**
```bash
kubectl config view --minify --raw -o jsonpath='{.clusters[0].cluster.server}'
```

3. **Actualizar la configuración para acceso desde DevContainer:**
```bash
# Editar app-config.local.yaml
nano /ruta/a/backstage/app-config.local.yaml
```

4. **Usar host.docker.internal en lugar de 127.0.0.1:**
```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        # ⬇️ IMPORTANTE: Para DevContainer usar host.docker.internal
        - url: https://host.docker.internal:54446  # NO usar 127.0.0.1
          name: kind-local
          authProvider: serviceAccount
          serviceAccountToken: TOKEN_ACTUAL
          skipTLSVerify: true
```

5. **Regenerar token si es necesario:**
```bash
kubectl create token backstage --duration=8760h
```

6. **Reiniciar Backstage:**
```bash
# Detener Backstage (Ctrl+C)
# Reiniciar
yarn dev
```

#### **Explicación:**
- `127.0.0.1` apunta al localhost **dentro** del DevContainer
- `host.docker.internal` apunta al localhost de la **máquina host**
- El cluster kind está en el host, no en el DevContainer

### **Error: "Error communicating with Kubernetes: Unauthorized"**

#### **Causa:** Token expirado o inválido

#### **Solución:**
1. **Regenerar token:**
```bash
kubectl create token backstage --duration=8760h
```

2. **Actualizar token en app-config.local.yaml**
3. **Reiniciar Backstage**

### **Error: "No resources found"**

#### **Causa:** El componente no está desplegado en K8s o las labels no coinciden

#### **Solución:**
1. **Verificar que el deployment existe:**
```bash
kubectl get deployment NOMBRE_COMPONENTE -A
```

2. **Si no existe, desplegarlo:**
```bash
kubectl create deployment NOMBRE_COMPONENTE --image=nginx:latest
kubectl label deployment NOMBRE_COMPONENTE backstage.io/kubernetes-id=NOMBRE_COMPONENTE
```

3. **Si existe pero no tiene las labels:**
```bash
kubectl label deployment NOMBRE_COMPONENTE backstage.io/kubernetes-id=NOMBRE_COMPONENTE
kubectl label pods -l app=NOMBRE_COMPONENTE backstage.io/kubernetes-id=NOMBRE_COMPONENTE
```

---

## 📝 Plantilla de Registro de Componentes

| Componente | Repo | Namespace | Estado K8s | Backstage Updated | Verificado |
|------------|------|-----------|------------|------------------|------------|
| python-app-1 | Portfolio-jaime/python-app-1 | default | ✅ Desplegado | ⏳ Pendiente | ❌ |
| go-service | Portfolio-jaime/go-service | default | ❌ No desplegado | ⏳ Pendiente | ❌ |
| java-app | Portfolio-jaime/java-app | production | ✅ Desplegado | ⏳ Pendiente | ❌ |

---

## 🎯 Comandos Útiles de Referencia

```bash
# Ver todos los componentes en el cluster
kubectl get all -A

# Ver información específica del cluster
kubectl cluster-info

# Verificar service account de backstage
kubectl get serviceaccount backstage -n default

# Generar nuevo token
kubectl create token backstage --duration=8760h

# Ver logs de un pod específico
kubectl logs -f pod/NOMBRE_POD -n NAMESPACE

# Describir un deployment
kubectl describe deployment NOMBRE_DEPLOYMENT -n NAMESPACE

# Agregar labels a recursos existentes
kubectl label deployment NOMBRE backstage.io/kubernetes-id=NOMBRE
kubectl label service NOMBRE backstage.io/kubernetes-id=NOMBRE
kubectl label configmap NOMBRE backstage.io/kubernetes-id=NOMBRE
```

---

## ⚡ Script de Automatización

```bash
#!/bin/bash
# add_k8s_labels.sh - Script para agregar labels de Backstage automáticamente

COMPONENT_NAME=$1
NAMESPACE=${2:-default}

if [ -z "$COMPONENT_NAME" ]; then
    echo "Uso: $0 <component-name> [namespace]"
    exit 1
fi

echo "Agregando labels de Backstage a: $COMPONENT_NAME en namespace: $NAMESPACE"

# Agregar labels a deployment
kubectl label deployment $COMPONENT_NAME backstage.io/kubernetes-id=$COMPONENT_NAME -n $NAMESPACE --overwrite

# Agregar labels a service
kubectl label service $COMPONENT_NAME backstage.io/kubernetes-id=$COMPONENT_NAME -n $NAMESPACE --overwrite 2>/dev/null

# Agregar labels a pods
kubectl label pods -l app=$COMPONENT_NAME backstage.io/kubernetes-id=$COMPONENT_NAME -n $NAMESPACE --overwrite

# Agregar labels a configmaps
kubectl label configmap $COMPONENT_NAME backstage.io/kubernetes-id=$COMPONENT_NAME -n $NAMESPACE --overwrite 2>/dev/null

echo "✅ Labels agregados exitosamente"
```

**Uso del script:**
```bash
chmod +x add_k8s_labels.sh
./add_k8s_labels.sh python-app-50 default
```