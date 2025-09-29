# 📋 Guía para Actualizar Componentes Existentes con Kubernetes

## 🎯 Componentes configurados en K8s

Los siguientes componentes ya tienen las **labels de Backstage** aplicadas en Kubernetes y están listos para la integración:

| Componente | Namespace | Replicas | Status | Acción Requerida |
|------------|-----------|----------|--------|------------------|
| **python-app-1** | python | 1/1 | ✅ Running | Actualizar catalog-info.yaml |
| **python-app-10** | dev1 | 1/1 | ✅ Running | Actualizar catalog-info.yaml |
| **python-app-11** | dev1 | 1/1 | ✅ Running | Actualizar catalog-info.yaml |
| **python-app-40** | prod1 | 2/2 | ✅ Running | Actualizar catalog-info.yaml |
| **python-app-50** | dev1 | 1/1 | ✅ Running | ✅ **Ya configurado** |
| **sample-app** | sample-app | 2/2 | ✅ Running | ✅ **Ya configurado** |

---

## 🔧 Para cada componente, actualizar su `catalog-info.yaml`

### **📝 Plantilla de anotaciones a agregar:**

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: COMPONENT_NAME
  description: Descripción del componente
  annotations:
    github.com/project-slug: Portfolio-jaime/REPO_NAME
    backstage.io/techdocs-ref: dir:.
    # ⬇️ AGREGAR ESTAS ANOTACIONES DE KUBERNETES ⬇️
    backstage.io/kubernetes-id: COMPONENT_NAME
    backstage.io/kubernetes-namespace: TARGET_NAMESPACE
  labels:
    environment: ENVIRONMENT  # development, production
    language: python
    deployment-type: kubernetes
  tags:
    - python
    - service
    - kubernetes
spec:
  type: service
  owner: TEAM_OWNER
  lifecycle: experimental
```

---

## 📋 Configuraciones específicas por componente:

### **1. python-app-1**
```yaml
annotations:
  backstage.io/kubernetes-id: python-app-1
  backstage.io/kubernetes-namespace: python
labels:
  environment: development
```

### **2. python-app-10**
```yaml
annotations:
  backstage.io/kubernetes-id: python-app-10
  backstage.io/kubernetes-namespace: dev1
labels:
  environment: development
```

### **3. python-app-11**
```yaml
annotations:
  backstage.io/kubernetes-id: python-app-11
  backstage.io/kubernetes-namespace: dev1
labels:
  environment: development
```

### **4. python-app-40**
```yaml
annotations:
  backstage.io/kubernetes-id: python-app-40
  backstage.io/kubernetes-namespace: prod1
labels:
  environment: production
```

---

## 🚀 Proceso de actualización:

### **Opción A: Edición manual**
1. Localizar el repositorio del componente
2. Editar `catalog-info.yaml`
3. Agregar las anotaciones correspondientes
4. Commit y push

### **Opción B: Si el componente no existe en Backstage**
Crear un nuevo `catalog-info.yaml` en el repositorio:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: python-app-X
  description: Python application running in Kubernetes
  annotations:
    github.com/project-slug: Portfolio-jaime/python-app-X
    backstage.io/techdocs-ref: dir:.
    backstage.io/kubernetes-id: python-app-X
    backstage.io/kubernetes-namespace: NAMESPACE
  labels:
    environment: development
    language: python
    deployment-type: kubernetes
  tags:
    - python
    - service
    - kubernetes
spec:
  type: service
  owner: development
  lifecycle: experimental
```

---

## ✅ Verificación post-actualización:

### **1. En Backstage UI:**
- Ir al catálogo
- Buscar el componente
- Verificar que aparezca el tab **"Kubernetes"**
- Verificar información de pods, services, deployments

### **2. En caso de errores:**

#### **"No records to display":**
```bash
# Verificar labels en K8s
kubectl get deployment COMPONENT_NAME -n NAMESPACE -o yaml | grep backstage

# Si no aparecen, reaplicar:
kubectl label deployment COMPONENT_NAME backstage.io/kubernetes-id=COMPONENT_NAME -n NAMESPACE --overwrite
```

#### **"Namespace not found":**
- Verificar que el namespace en `catalog-info.yaml` coincida con el real en K8s

#### **"Connection refused":**
- Verificar que Backstage esté usando `host.docker.internal` en lugar de `127.0.0.1`

---

## 🎯 Resultados esperados:

Una vez configurados, cada componente mostrará en Backstage:

### **📊 Tab Kubernetes con:**
- **Deployments**: Estado y replicas
- **Pods**: Status, restarts, logs
- **Services**: Tipo, puertos, IPs
- **ConfigMaps**: Si existen
- **Métricas**: CPU/Memory (con metrics-server)

### **🔍 Información detallada:**
- **Namespace**: Correcto
- **Cluster**: kind-local
- **Labels**: backstage.io/kubernetes-id
- **Estado**: Running/Ready

---

## 🛠️ Comandos útiles:

```bash
# Ver todos los componentes con labels de Backstage
kubectl get deployments -A -l backstage.io/kubernetes-id

# Verificar un componente específico
kubectl get all -n NAMESPACE -l backstage.io/kubernetes-id=COMPONENT_NAME

# Ver métricas (si metrics-server está instalado)
kubectl top pods -n NAMESPACE

# Ver logs de un pod
kubectl logs -f deployment/COMPONENT_NAME -n NAMESPACE
```

---

## 🎉 ¡Listo!

Después de actualizar los `catalog-info.yaml`, todos tus componentes Python tendrán integración completa con Kubernetes en Backstage, mostrando información en tiempo real de tus deployments.