# 🚀 Guía de Inicio Rápido - Backstage DevOps Course

## ⚡ Start en 5 Minutos

### 📋 Prerrequisitos Verificados

- [x] Docker 20.10+ instalado y funcionando
- [x] Docker Compose 2.0+ disponible
- [x] GitHub Personal Access Token configurado
- [x] GitHub OAuth App configurada
- [x] Puertos 3001, 7008, 5433 disponibles

### 🔥 Inicio Inmediato

```bash
# 1. Navegar al directorio Docker
cd /Users/jaime.henao/arheanja/Backstage-solutions/backstage-app/Docker

# 2. Iniciar servicios (PostgreSQL + Backstage)
docker-compose up -d

# 3. Esperar inicialización (2-3 minutos)
docker-compose logs -f backstage-app

# 4. Iniciar Backstage manualmente en el contenedor
docker exec backstage-app bash -c "cd /app/backstage && yarn start" &

# 5. Verificar funcionamiento
curl http://localhost:3001  # Frontend
curl http://localhost:7008/api/catalog/entities  # Backend API
```

### 🌐 URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend UI** | http://localhost:3001 | ✅ Funcionando |
| **Backend API** | http://localhost:7008 | ✅ Funcionando |
| **PostgreSQL** | localhost:5433 | ✅ Funcionando |
| **Documentación** | http://localhost:3001/docs | ✅ Disponible |

---

## 🎯 Casos de Uso Inmediatos

### 1️⃣ Explorar el Catálogo

```bash
# Acceder a la UI
open http://localhost:3001

# O via API
curl http://localhost:7008/api/catalog/entities | jq
```

**Entidades Precargadas:**
- 🏗️ **Sistema**: `backstage-course` 
- 🖥️ **Componente**: `backstage-frontend`
- ⚙️ **Componente**: `backstage-backend`
- 🐍 **Componente**: `python-demo-app`
- 📊 **API**: `backstage-backend-api`
- 🗄️ **Resource**: `postgres-database`

### 2️⃣ Autenticación GitHub

1. **Ir a**: http://localhost:3001
2. **Click**: "Sign in with GitHub"
3. **Autorizar**: OAuth App si es primera vez
4. **Explorar**: Catálogo con tu identidad GitHub

### 3️⃣ Registrar Nueva Entidad

**Via UI:**
1. Catalog → "Register Entity"
2. Repository URL: `https://github.com/your-user/your-repo`
3. File: `catalog-info.yaml`
4. "Analyze" → "Import"

**Via API:**
```bash
curl -X POST http://localhost:7008/api/catalog/locations \
  -H "Content-Type: application/json" \
  -d '{
    "type": "url",
    "target": "https://github.com/your-user/your-repo/blob/main/catalog-info.yaml"
  }'
```

### 4️⃣ Crear Componente desde Template

1. **Create** → "Choose a template"
2. **Select**: "React SSR Template" 
3. **Fill**: Parámetros requeridos
4. **Review** → "Create"
5. **Track**: Progress en Tasks

---

## 🔧 Comandos de Administración

### 📊 Monitoreo

```bash
# Status de contenedores
docker-compose ps

# Uso de recursos
docker stats backstage-app backstage-postgres

# Logs específicos
docker logs -f backstage-app | grep -i error
docker logs -f backstage-postgres

# Health checks
curl -s http://localhost:7008/api/catalog/entities | jq '.length'
docker exec backstage-postgres pg_isready -U backstage
```

### 🗄️ Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it backstage-postgres psql -U backstage -d backstage

# Consultas útiles
SELECT kind, COUNT(*) FROM entities GROUP BY kind;
SELECT * FROM locations ORDER BY id;
SELECT * FROM refresh_state ORDER BY last_discovery_at DESC LIMIT 5;

# Backup
docker exec backstage-postgres pg_dump -U backstage backstage > backup.sql
```

### 🔄 Reiniciar Servicios

```bash
# Restart solo Backstage
docker-compose restart backstage-app

# Restart completo (mantiene datos)
docker-compose down && docker-compose up -d

# Reset completo (PIERDE DATOS)
docker-compose down --volumes
docker-compose up -d
```

---

## 🐛 Troubleshooting Rápido

### ❌ Problemas Comunes

**1. Puerto 3000 ocupado**
```bash
lsof -i :3001
# Matar proceso o cambiar puerto en docker-compose.yml
```

**2. Backstage no inicia**
```bash
# Ver logs específicos
docker logs backstage-app | tail -50

# Verificar variables de entorno
docker exec backstage-app env | grep -E "(POSTGRES|GITHUB)"
```

**3. Database connection failed**
```bash
# Verificar PostgreSQL
docker exec backstage-postgres pg_isready -U backstage

# Recrear database
docker-compose down
docker volume rm docker_postgres_data
docker-compose up -d
```

**4. GitHub integration not working**
```bash
# Test GitHub token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Verificar OAuth settings en GitHub:
# - Homepage URL: http://localhost:3001
# - Callback URL: http://localhost:7008/api/auth/github/handler/frame
```

### 🆘 Emergency Reset

```bash
#!/bin/bash
echo "🚨 Emergency Reset - ALL DATA WILL BE LOST!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
  docker-compose down --volumes --remove-orphans
  docker system prune -a -f --volumes
  docker-compose build --no-cache
  docker-compose up -d
  echo "✅ Reset complete. Wait 3 minutes for startup."
fi
```

---

## 📚 Recursos de Aprendizaje

### 🎓 Labs del Curso

1. **Lab 1: Basic Setup** ✅ - Completado
2. **Lab 2: Entity Management** - Explorar catálogo y registrar entidades
3. **Lab 3: Templates & Scaffolding** - Crear nuevos componentes
4. **Lab 4: Kubernetes Integration** - Conectar clusters K8s
5. **Lab 5: Custom Plugins** - Desarrollar funcionalidad personalizada

### 📖 Documentación Disponible

- **Arquitectura**: [docs/course/architecture.md](./docs/course/architecture.md)
- **Troubleshooting**: [docs/course/troubleshooting.md](./docs/course/troubleshooting.md)
- **Setup Completo**: [docs/SETUP_FINAL.md](./docs/SETUP_FINAL.md)
- **README Principal**: [README.md](./README.md)

### 🔗 Enlaces Útiles

- **Backstage Docs**: https://backstage.io/docs/
- **GitHub Repo**: https://github.com/jaime-henao/backstage-course
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 🎯 Objetivos de Aprendizaje

Al completar esta guía habrás:

- [x] **Desplegado** un entorno Backstage funcional con persistencia
- [x] **Configurado** autenticación GitHub OAuth
- [x] **Explorado** el catálogo de software predefinido
- [x] **Registrado** entidades desde repositorios GitHub
- [x] **Comprendido** la arquitectura y componentes principales
- [x] **Aprendido** comandos básicos de administración y troubleshooting

### 🔜 Próximos Pasos

1. **Explorar Templates**: Crear componentes desde scaffolding
2. **Personalizar Catálogo**: Añadir tus propios sistemas y APIs
3. **Integrar Kubernetes**: Visualizar recursos de clusters
4. **Desarrollar Plugin**: Crear funcionalidad específica para BA
5. **Deploy Production**: Configurar entorno productivo en AWS

---

**⏱️ Tiempo Total**: 5-10 minutos para setup inicial  
**🆘 Soporte**: jaime.andres.henao.arbelaez@ba.com  
**📅 Última actualización**: Agosto 2024

¡Tu entorno Backstage está listo para el curso! 🎉