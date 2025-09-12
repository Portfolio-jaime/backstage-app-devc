#!/bin/bash
# Fix Minikube kubeconfig permissions for the devcontainer
set -e

KUBECONFIG_FILE="$HOME/.kube/config"
KUBECONFIG_LOCK_FILE="$HOME/.kube/config.lock"

if [ -f "$KUBECONFIG_FILE" ]; then
  sudo chown $USER "$KUBECONFIG_FILE"
  sudo chmod 600 "$KUBECONFIG_FILE"
fi

if [ -f "$KUBECONFIG_LOCK_FILE" ]; then
  sudo chown $USER "$KUBECONFIG_LOCK_FILE"
  sudo chmod 600 "$KUBECONFIG_LOCK_FILE"
fi
