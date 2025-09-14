#!/bin/bash
# Fix Minikube/kind kubeconfig permissions for the devcontainer
set -e

KUBE_DIR="$HOME/.kube"
KUBECONFIG_FILE="$KUBE_DIR/config"
KUBECONFIG_LOCK_FILE="$KUBE_DIR/config.lock"


# Fix directory permissions
if [ -d "$KUBE_DIR" ]; then
  echo "Fixing permissions for $KUBE_DIR"
  sudo chown -R "$USER:$USER" "$KUBE_DIR"
  sudo chmod 700 "$KUBE_DIR"
else
  echo "$KUBE_DIR does not exist, skipping directory permissions."
fi

# Fix file permissions
if [ -f "$KUBECONFIG_FILE" ]; then
  echo "Fixing permissions for $KUBECONFIG_FILE"
  sudo chown "$USER:$USER" "$KUBECONFIG_FILE"
  sudo chmod 600 "$KUBECONFIG_FILE"
else
  echo "$KUBECONFIG_FILE does not exist, skipping file permissions."
fi

if [ -f "$KUBECONFIG_LOCK_FILE" ]; then
  echo "Fixing permissions for $KUBECONFIG_LOCK_FILE"
  sudo chown "$USER:$USER" "$KUBECONFIG_LOCK_FILE"
  sudo chmod 600 "$KUBECONFIG_LOCK_FILE"
else
  echo "$KUBECONFIG_LOCK_FILE does not exist, skipping lock file permissions."
fi
