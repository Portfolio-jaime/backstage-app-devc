# Backstage DevContainer Setup

Este devcontainer está configurado para el curso de DevOps de Backstage para British Airways.

## 🚀 Quick Start

1. **Abrir en VS Code**:

   - Abre VS Code en el directorio del proyecto
   - Cuando aparezca la notificación "Reopen in Container", selecciona esa opción
   - O usa Command Palette: `Dev Containers: Reopen in Container`

2. **Configurar GitHub Integration**:

   ```bash
   # Dentro del devcontainer, ejecuta:
   ./.devcontainer/setup-course.sh
   ```

3. **Iniciar servicios**:

   ```bash
   # Los servicios se inician automáticamente con docker-compose
   # Verificar estado:
   docker-compose ps
   ```

4. **Acceder a Backstage**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:7008

## 📦 Incluye

- **Node.js 20** con npm actualizado
- **Python 3** con mkdocs-techdocs-core
- **PostgreSQL** para persistencia
- **Git & GitHub CLI** para integración
- **kubectl & Helm** para Kubernetes
- **Extensiones de VS Code** optimizadas para Backstage

## 🛠️ Configuración

- **Puerto Frontend**: 3001 (auto-forwarded)
- **Puerto Backend**: 7008 (auto-forwarded)
- **PostgreSQL**: 5433
- **Workspace**: `/app`
- **Usuario**: `node`

## 🔧 Scripts Disponibles

- `.devcontainer/setup-course.sh` - Configuración inicial de GitHub
- `.devcontainer/generate-secrets.sh` - Generar secretos de seguridad

## 📝 Notas

- El archivo `.env` debe existir en el directorio raíz para la configuración
- Los volúmenes de Docker persisten los datos de PostgreSQL
- Hot reload está habilitado para desarrollo
