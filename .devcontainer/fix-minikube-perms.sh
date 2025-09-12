#!/bin/bash
# Fix Minikube/kind kubeconfig permissions for the devcontainer
set -e

KUBE_DIR="$HOME/.kube"
KUBECONFIG_FILE="$KUBE_DIR/config"
KUBECONFIG_LOCK_FILE="$KUBE_DIR/config.lock"

# Fix directory permissions
if [ -d "$KUBE_DIR" ]; then
  sudo chown -R $USER:$USER "$KUBE_DIR"
  sudo chmod 700 "$KUBE_DIR"
fi

# Fix file permissions
if [ -f "$KUBECONFIG_FILE" ]; then
  sudo chown $USER "$KUBECONFIG_FILE"
  sudo chmod 600 "$KUBECONFIG_FILE"
fi

if [ -f "$KUBECONFIG_LOCK_FILE" ]; then
  sudo chown $USER "$KUBECONFIG_LOCK_FILE"
  sudo chmod 600 "$KUBECONFIG_LOCK_FILE"
fi
