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


')

# 4. Cambiar la contraseña de admin
echo "[4/6] Cambiando la contraseña de admin..."
hashpw=$(htpasswd -bnBC 10 "" "$NEW_PASSWORD" | awk -F: '{print $2}' | tr -d '\n')
kubectl -n $NAMESPACE patch secret argocd-secret -p "{\"stringData\": {\"admin.password\": \"$hashpw\", \"admin.passwordMtime\": \"$(date +%FT%T%Z)\"}}"

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
