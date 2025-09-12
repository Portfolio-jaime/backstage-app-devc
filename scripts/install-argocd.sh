#!/bin/bash
# Script para instalar ArgoCD en Minikube y cambiar la contraseña de admin
# Autor: Jaime Henao
# Fecha: 12/09/2025

set -e

NAMESPACE="argocd"
NEW_PASSWORD="Thomas#1109"  # Cambia esto por tu contraseña deseada

# 1. Crear namespace para ArgoCD
echo "[1/6] Creando namespace $NAMESPACE..."
kubectl create namespace $NAMESPACE || echo "Namespace $NAMESPACE ya existe."

# 2. Instalar ArgoCD
echo "[2/6] Instalando ArgoCD..."
kubectl apply -n $NAMESPACE -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Esperar a que los pods estén listos
echo "[3/6] Esperando a que los pods de ArgoCD estén en estado Running..."
kubectl wait --for=condition=available --timeout=180s deployment/argocd-server -n $NAMESPACE



# 4. Cambiar la contraseña de admin
# 4. Instalar ArgoCD CLI y cambiar la contraseña de admin
echo "[4/6] Instalando ArgoCD CLI..."
VERSION=$(curl -s https://api.github.com/repos/argoproj/argo-cd/releases/latest | grep tag_name | cut -d '"' -f4)
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
	ARGOCD_URL="https://github.com/argoproj/argo-cd/releases/download/$VERSION/argocd-linux-amd64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
	ARGOCD_URL="https://github.com/argoproj/argo-cd/releases/download/$VERSION/argocd-linux-arm64"
else
	echo "Arquitectura $ARCH no soportada para ArgoCD CLI" >&2
	exit 1
fi
sudo curl -sSL -o /usr/local/bin/argocd "$ARGOCD_URL"
sudo chmod +x /usr/local/bin/argocd

echo "[4/6] Cambiando la contraseña de admin con argocd CLI..."
# Asegurar permisos correctos sobre el directorio de configuración de ArgoCD CLI
sudo chown -R node:node /home/node/.argocd || true
# Esperar a que el port-forward esté activo antes de ejecutar este paso
sleep 5
argocd login localhost:8080 --username admin --password $(kubectl -n $NAMESPACE get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d) --insecure
argocd account update-password --account admin --current-password $(kubectl -n $NAMESPACE get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d) --new-password "$NEW_PASSWORD"

# (Opcional) Eliminar el secreto de contraseña inicial
kubectl -n $NAMESPACE delete secret argocd-initial-admin-secret || true

# 5. Reiniciar el pod de ArgoCD server
echo "[5/6] Reiniciando el pod argocd-server..."
kubectl -n $NAMESPACE delete pod -l app.kubernetes.io/name=argocd-server

# 6. Mostrar acceso y credenciales
echo "[6/6] Instalación y cambio de contraseña completados."
echo "Accede a ArgoCD en: http://localhost:8080 (usa port-forward si es necesario)"
echo "Usuario: admin"
echo "Contraseña: $NEW_PASSWORD"
echo "Para exponer el servicio ejecuta:"
echo "kubectl port-forward --address 0.0.0.0 svc/argocd-server -n argocd 8080:443"
