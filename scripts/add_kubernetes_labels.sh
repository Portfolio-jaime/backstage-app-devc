#!/bin/bash
# Script para agregar labels de Backstage a componentes existentes

set -e

echo "🚀 Agregando labels de Backstage a componentes existentes..."

# Función para agregar labels a un componente
add_backstage_labels() {
    local component=$1
    local namespace=$2

    echo "📝 Procesando: $component en namespace $namespace"

    # Agregar labels a deployment
    if kubectl get deployment $component -n $namespace >/dev/null 2>&1; then
        kubectl label deployment $component backstage.io/kubernetes-id=$component -n $namespace --overwrite
        echo "  ✅ Deployment labeled"
    fi

    # Agregar labels a service
    if kubectl get service $component -n $namespace >/dev/null 2>&1; then
        kubectl label service $component backstage.io/kubernetes-id=$component -n $namespace --overwrite
        echo "  ✅ Service labeled"
    fi

    # Agregar labels a pods
    local pod_selector=$(kubectl get deployment $component -n $namespace -o jsonpath='{.spec.selector.matchLabels}' 2>/dev/null)
    if [ ! -z "$pod_selector" ]; then
        # Usar selector genérico para pods
        kubectl label pods -l app.kubernetes.io/name=$component backstage.io/kubernetes-id=$component -n $namespace --overwrite 2>/dev/null || \
        kubectl label pods -l app=$component backstage.io/kubernetes-id=$component -n $namespace --overwrite 2>/dev/null || \
        echo "  ⚠️  No se pudieron etiquetar los pods (puede ser normal)"
        echo "  ✅ Pods processed"
    fi

    # Agregar labels a configmaps (opcional)
    if kubectl get configmap $component -n $namespace >/dev/null 2>&1; then
        kubectl label configmap $component backstage.io/kubernetes-id=$component -n $namespace --overwrite
        echo "  ✅ ConfigMap labeled"
    fi

    echo "  🎯 Componente $component configurado completamente"
    echo ""
}

# Aplicar labels a los componentes identificados
echo "🔧 Configurando componentes Python..."

add_backstage_labels "python-app-1" "python"
add_backstage_labels "python-app-10" "dev1"
add_backstage_labels "python-app-11" "dev1"
add_backstage_labels "python-app-40" "prod1"

echo "🎉 ¡Todos los componentes han sido configurados!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Actualizar los catalog-info.yaml de cada componente"
echo "2. Verificar en Backstage que aparezca el tab de Kubernetes"
echo "3. Refresh de los componentes en Backstage"
echo ""
echo "🔍 Para verificar:"
echo "kubectl get deployments -A -l backstage.io/kubernetes-id"