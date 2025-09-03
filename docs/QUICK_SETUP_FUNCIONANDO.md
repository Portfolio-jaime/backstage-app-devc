# 🚀 Guía de Setup Rápido - ✅ CONFIGURACIÓN FUNCIONANDO

## ⚡ Inicio en 3 Pasos - GARANTIZADO

### 📋 Verificaciones Previas ✅

- [x] **Docker Desktop** funcionando (versión 20.10+)
- [x] **VS Code** con extensión "Dev Containers" instalada  
- [x] **Git** configurado
- [x] **Puertos libres**: 3001, 7008, 5433

### 🔥 Paso 1: Abrir DevContainer

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd backstage-app-devc

# 2. Abrir en VS Code
code .

# 3. Comando en VS Code (Cmd+Shift+P):
Dev Containers: Reopen in Container
```

**⏱️ Tiempo esperado**: 3-5 minutos (primera vez)

### 🔧 Paso 2: Iniciar Backstage

Una vez dentro del DevContainer, en la terminal de VS Code:

```bash
# Navegar al directorio de Backstage
cd backstage

# Iniciar desarrollo (frontend + backend)
yarn dev
```

**⏱️ Tiempo esperado**: 1-2 minutos

### 🌐 Paso 3: Verificar Funcionamiento

Abrir en el navegador:

| Servicio | URL | Respuesta Esperada |
|----------|-----|-------------------|
| **Frontend** | http://localhost:3001 | Interfaz de Backstage ✅ |
| **Backend** | http://localhost:7008/api/catalog/entities | JSON (401 sin auth) ✅ |

---

## 🎯 Configuración que FUNCIONA

### Docker Compose (Mapeo 1:1)
```yaml
# .devcontainer/docker-compose.yml
services:
  backstage-app:
    ports:
      - "3001:3001"  # ✅ Frontend 1:1
      - "7008:7008"  # ✅ Backend 1:1  
      - "5433:5432"  # ✅ Database
```

### Backstage Config
```yaml
# backstage/app-config.yaml
app:
  baseUrl: http://localhost:3001  # ✅

backend:
  baseUrl: http://localhost:7008  # ✅
  listen:
    port: 7008  # ✅
  cors:
    origin: http://localhost:3001  # ✅
```

---

## 🐛 Troubleshooting Rápido

### ❌ "El navegador no hace nada"

**Solución rápida:**
```bash
# 1. Parar contenedores conflictivos
docker stop $(docker ps -q --filter "name=backstage")

# 2. Limpiar cache de VS Code
rm -rf ~/Library/Application\ Support/Code/User/globalStorage/ms-vscode-remote.remote-containers/

# 3. Rebuild DevContainer
# En VS Code: Cmd+Shift+P → "Dev Containers: Rebuild and Reopen in Container"
```

### ❌ Errores de puerto ocupado

```bash
# Verificar puertos en uso
lsof -i :3001
lsof -i :7008  
lsof -i :5433

# Liberar si es necesario
kill -9 <PID>
```

### ❌ Backstage no inicia

```bash
# Dentro del DevContainer:
cd backstage

# Limpiar y reinstalar
yarn clean
yarn install
yarn dev
```

---

## ✅ Verificación Completa

### Estado de Contenedores
```bash
docker ps | grep backstage
# Debe mostrar:
# - backstage-app-devc (puertos 3001->3001, 7008->7008)
# - backstage-postgres-devc (puerto 5433->5432)
```

### Respuesta HTTP
```bash
# Frontend OK
curl -I http://localhost:3001
# → HTTP/1.1 200 OK

# Backend OK (con auth requerido)
curl -I http://localhost:7008/api/catalog/entities  
# → HTTP/1.1 401 Unauthorized (esperado)
```

### Logs Sin Errores
```bash
docker logs backstage-app-devc --tail 20
# Debe mostrar logs normales, sin errores críticos
```

---

## 🎓 Primeros Pasos Post-Setup

### 1. Configurar GitHub OAuth

1. Ir a GitHub → Settings → Developer settings → OAuth Apps
2. Crear nueva OAuth App:
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:7008/api/auth/github/handler/frame`
3. Actualizar `.env` con Client ID y Secret

### 2. Explorar Backstage

- **Catalog**: http://localhost:3001/catalog
- **Create Component**: http://localhost:3001/create  
- **API Docs**: http://localhost:3001/api-docs
- **TechDocs**: http://localhost:3001/docs

### 3. Desarrollo

```bash
# Hot reload está activo - los cambios se reflejan automáticamente
# Frontend: modificar archivos en packages/app/
# Backend: modificar archivos en packages/backend/
```

---

## 📊 Performance Esperado

### Recursos del Sistema
- **CPU**: 15-25% (durante desarrollo)
- **RAM**: ~1.2GB total
- **Disk**: ~2GB (imagen + volúmenes)

### Tiempos de Respuesta
- **Frontend**: < 2 segundos (primera carga)
- **API calls**: < 500ms
- **Hot reload**: 5-15 segundos

---

## 🆘 Soporte

**Si algo no funciona:**

1. **Verificar esta guía paso a paso**
2. **Consultar**: [docs/CONFIGURACION_FINAL_FUNCIONANDO.md](./CONFIGURACION_FINAL_FUNCIONANDO.md)
3. **Logs detallados**: `docker logs -f backstage-app-devc`
4. **Contacto**: jaime.andres.henao.arbelaez@ba.com

---

## 🏆 Éxito Confirmado

**✅ Si puedes ver la interfaz de Backstage en http://localhost:3001 - ¡ÉXITO COMPLETO!**

El entorno está listo para:
- ✅ Desarrollo de plugins
- ✅ Configuración avanzada  
- ✅ Integración con servicios externos
- ✅ Trabajo en equipo

---

*Guía creada por: Jaime Henao - British Airways DevOps Training*  
*Fecha: Septiembre 2025*  
*Estado: VERIFICADO Y FUNCIONANDO*