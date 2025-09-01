# Corrección de Error TechDocs: "spawn mkdocs ENOENT"

## Problema Identificado

Error en TechDocs de Backstage al intentar generar documentación:
```
Failed to generate docs from /tmp/backstage-1Vjo5d into /tmp/techdocs-tmp-e8KSfc; 
caused by Error: spawn mkdocs ENOENT
```

## Análisis del Problema

### 1. **Error "spawn mkdocs ENOENT"**
- Indicaba que `mkdocs` no estaba disponible en el contenedor de Backstage
- El proceso TechDocs no podía encontrar el ejecutable `mkdocs`

### 2. **Configuración Incorrecta en mkdocs.yaml**
- Ruta incorrecta en la navegación: `'docs/index.md'`
- Debería ser: `'index.md'` (relativa al directorio docs/)

### 3. **Error de Sintaxis en Dockerfile**
- Línea duplicada de `apt-get install` causaba problemas en el build

## Solución Implementada

### 1. **Corrección del Dockerfile** 
```dockerfile
# Antes (líneas 8-16) - INCORRECTO
RUN apt-get update && apt-get install -y \
    apt-get install -y python3 python3-pip python3-venv && \
    git \
    curl \
    # ... resto de paquetes

# Después (líneas 8-17) - CORRECTO  
RUN apt-get update && apt-get install -y \
    git \
    curl \
    openssl \
    python3 \
    python3-pip \
    python3-venv \
    nano \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
```

### 2. **Configuración de Entorno Virtual Python**
```dockerfile
# Creamos un entorno virtual para Python
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Instalamos mkdocs-techdocs-core en el entorno virtual
RUN pip3 install mkdocs-techdocs-core
```

### 3. **Corrección de mkdocs.yaml**
```yaml
# Antes - INCORRECTO
nav:
  - Overview:
      - Getting started: 'docs/index.md'

# Después - CORRECTO
nav:
  - Overview:
      - Getting started: 'index.md'
```

## Archivos Modificados

1. **`/Docker/Dockerfile`**
   - Corregida sintaxis de instalación de paquetes
   - Mantenida instalación de `mkdocs-techdocs-core`

2. **`/Repos-portfolio/python-app-1/mkdocs.yaml`**
   - Corregida ruta de navegación en el índice

## Verificación de la Solución

### Prueba Local (para verificar configuración)
```bash
cd /path/to/python-app-1
mkdocs build
# Resultado: Documentación generada exitosamente en /site/
```

### Estructura Resultante
```
python-app-1/
├── mkdocs.yaml          # Configuración corregida
├── docs/
│   └── index.md         # Contenido de documentación
└── site/                # Documentación generada
    ├── index.html
    ├── techdocs_metadata.json
    └── assets/
```

## Pasos para Aplicar la Corrección

### 1. **Rebuild del Contenedor**
```bash
# Desde el directorio del proyecto
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. **Verificar Instalación en Contenedor**
```bash
# Conectar al contenedor
docker exec -it backstage-container bash

# Verificar mkdocs
which mkdocs
mkdocs --version

# Debería mostrar:
# mkdocs, version X.X.X from /opt/venv/lib/python3.x/site-packages/mkdocs
```

### 3. **Probar TechDocs**
1. Acceder a Backstage UI
2. Navegar al componente `python-app-1`
3. Hacer clic en la pestaña "Docs"
4. Verificar que la documentación se carga correctamente

## Dependencias Instaladas

El contenedor ahora incluye:
- **mkdocs**: Generador de documentación estática
- **mkdocs-techdocs-core**: Plugin específico para Backstage TechDocs
- **Dependencias asociadas**: 
  - mkdocs-material (tema)
  - pymdown-extensions (extensiones Markdown)
  - plantuml-markdown (soporte PlantUML)
  - Y otras dependencias del ecosistema TechDocs

## Resultado Esperado

✅ **TechDocs funcionando correctamente**
- Sin errores "spawn mkdocs ENOENT"
- Documentación generada y visible en Backstage
- Navegación funcionando correctamente
- Metadatos de TechDocs presentes

## Troubleshooting

### Si persiste el error:
1. **Verificar rebuild completo**: `docker-compose build --no-cache`
2. **Verificar logs**: `docker-compose logs backstage`
3. **Verificar PATH en contenedor**: `echo $PATH` debe incluir `/opt/venv/bin`
4. **Verificar permisos**: mkdocs debe ser ejecutable en el contenedor

### Para debugging:
```bash
# Verificar entorno virtual
source /opt/venv/bin/activate
which mkdocs

# Test manual de build
cd /tmp && git clone <repo-url> && cd <repo> && mkdocs build
```

---

**Autor:** Jaime Henao <jaime.andres.henao.arbelaez@ba.com>  
**Fecha:** 2025-08-22  
**Componente:** Backstage TechDocs  
**Estado:** ✅ Resuelto