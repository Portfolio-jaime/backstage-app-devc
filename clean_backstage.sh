#!/bin/bash
# Script para limpiar caches y temporales de Backstage

echo "🧹 Limpiando Backstage..."

# 1. Limpiar node_modules y cache de yarn
if [ -d "node_modules" ]; then
  echo "🔹 Eliminando node_modules..."
  rm -rf node_modules
fi

if [ -d "packages/app/node_modules" ]; then
  echo "🔹 Eliminando node_modules de packages/app..."
  rm -rf packages/app/node_modules
fi

echo "🔹 Limpiando cache de yarn..."
yarn cache clean

# 2. Limpiar logs temporales del Scaffolder
echo "🔹 Limpiando logs temporales del Scaffolder en /tmp..."
rm -rf /tmp/backstage-logs-* || true

# 3. Limpiar repositorios temporales generados por plantillas
echo "🔹 Limpiando repositorios temporales del Scaffolder en /tmp..."
rm -rf /tmp/fd* || true
rm -rf /tmp/4422* || true
rm -rf /tmp/7862* || true

# 4. Limpiar base de datos SQLite local (solo si quieres resetear el cache de entidades)
DB_FILE=~/.backstage/sqlite.db
if [ -f "$DB_FILE" ]; then
  echo "🔹 Renombrando base de datos local para conservar backup..."
  mv "$DB_FILE" "$DB_FILE.bak_$(date +%s)"
fi

echo "✅ Limpieza completa. Puedes iniciar Backstage de nuevo."
