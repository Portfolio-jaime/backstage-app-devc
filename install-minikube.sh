#!/bin/bash
# Instala Minikube en un contenedor Debian/Ubuntu (DevContainer)
set -e

# 1. Instalar dependencias
apt-get update && apt-get install -y curl conntrack

# 2. Descargar el binario de Minikube
MINIKUBE_VERSION=$(curl -s https://api.github.com/repos/kubernetes/minikube/releases/latest | grep tag_name | cut -d '"' -f4)
echo "Descargando Minikube $MINIKUBE_VERSION..."
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube
mv minikube /usr/local/bin/

# 3. Verificar instalación
minikube version

echo "✅ Minikube instalado correctamente."
