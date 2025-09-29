# 📋 Dashboard Backstage - Tareas Pendientes

## 🎯 **Estado Actual**
- ✅ **Configuración externa funcionando** desde GitHub
- ✅ **Widgets simulados eliminados** (flightOps, costDashboard, security, systemHealth)
- ✅ **Zonas horarias sudamericanas añadidas** (Colombia, Chile, Uruguay, Argentina)
- ⚠️ **Widgets reales funcionando parcialmente**

---

## 🛠️ **Problemas Identificados para Mañana**

### 1. **World Clock - Zonas Horarias** 🕐
**Problema**: Las zonas horarias sudamericanas no aparecen en el widget
**Causa**: El widget WorldClock puede no estar procesando correctamente el config
**Archivos a revisar**:
- `backstage/packages/app/src/components/home/widgets/WorldClock.tsx`
- Parser en `useDashboardConfig.ts:121-140`

### 2. **GitHub Activity Widget** 📊
**Problema**: Errores 404 en repositorios
```
GET https://api.github.com/repos/Portfolio-jaime/backstage-solutions/events 404
GET https://api.github.com/repos/Portfolio-jaime/Go-app-1/events 404
```
**Causa**: Repositorios no existen o nombres incorrectos
**Archivos a revisar**:
- Configuración en dashboard: `templates/ba-devops-dashboard/config.yaml:20-27`
- Widget: `backstage/packages/app/src/components/home/widgets/TeamActivity.tsx`

### 3. **Backstage Catalog Widget** 📚
**Problema**: CORS errors al acceder a GitHub API
```
Access to fetch at 'https://api.github.com/repos///contents/' blocked by CORS
```
**Causa**: URL malformada o configuración incorrecta
**Archivos a revisar**:
- `backstage/packages/app/src/components/home/widgets/LiveCatalogServices.tsx`

---

## 🔧 **Plan de Acción para Mañana**

### **Paso 1: Verificar World Clock**
```bash
# Revisar el componente WorldClock
cd backstage/packages/app/src/components/home/widgets/
code WorldClock.tsx

# Buscar cómo procesa el config.spec.widgets.worldClock.timezones
```

### **Paso 2: Corregir GitHub Activity**
```bash
# Verificar repositorios existentes
curl -s https://api.github.com/users/Portfolio-jaime/repos | jq '.[].name'

# Actualizar configuración con repos reales
cd /Users/jaime.henao/arheanja/Backstage-solutions/Repos-portfolio/backstage-dashboard-templates
code templates/ba-devops-dashboard/config.yaml
```

### **Paso 3: Depurar Catalog Widget**
```bash
# Revisar configuración del catalog
cd backstage/packages/app/src/components/home/widgets/
code LiveCatalogServices.tsx

# Verificar si está usando la API correcta
```

---

## 📁 **Archivos Clave**

### **Configuración Dashboard**
- `📂 /Users/jaime.henao/arheanja/Backstage-solutions/Repos-portfolio/backstage-dashboard-templates/`
  - `📄 templates/ba-devops-dashboard/config.yaml` - Configuración principal

### **Hook de Configuración**
- `📂 backstage/packages/app/src/hooks/`
  - `📄 useDashboardConfig.ts` - Parser YAML y carga desde GitHub

### **Widgets Problemáticos**
- `📂 backstage/packages/app/src/components/home/widgets/`
  - `📄 WorldClock.tsx` - Widget de zonas horarias
  - `📄 TeamActivity.tsx` - Widget de actividad GitHub
  - `📄 LiveCatalogServices.tsx` - Widget del catálogo

### **Página Principal**
- `📂 backstage/packages/app/src/components/home/`
  - `📄 HomePage.tsx` - Componente principal que usa el hook

---

## 🚀 **Comandos Útiles**

### **Para debuggear en el navegador:**
```javascript
// Abrir consola (F12) y buscar estos logs:
// 🔄 Fetching dashboard configuration...
// ✅ Dashboard configuration loaded successfully!
// 🎛️ Widgets enabled: ['github', 'catalog', 'worldClock']
```

### **Para actualizar configuración:**
```bash
cd /Users/jaime.henao/arheanja/Backstage-solutions/Repos-portfolio/backstage-dashboard-templates
git add .
git commit -m "fix: update dashboard configuration"
git push
# Esperar 5 minutos para auto-actualización
```

### **Para reiniciar Backstage:**
```bash
cd /Users/jaime.henao/arheanja/Backstage-solutions/backstage-app-devc/backstage
yarn start
```

---

## 📊 **Progreso Actual**

- [x] ✅ **Sistema de configuración externa** - Funcionando
- [x] ✅ **Eliminación de datos simulados** - Completado  
- [x] ✅ **Añadir zonas horarias sudamericanas** - En configuración
- [ ] ⏳ **Widget World Clock mostrando zonas** - Pendiente
- [ ] ⏳ **GitHub Activity sin errores 404** - Pendiente
- [ ] ⏳ **Catalog Widget sin errores CORS** - Pendiente

---

## 💡 **Notas Importantes**

1. **La configuración se carga correctamente desde GitHub** ✅
2. **El parser ahora detecta bien enabled: false** ✅  
3. **Los widgets simulados ya no aparecen** ✅
4. **El problema principal está en la implementación de los widgets individuales** ⚠️

---

## 📞 **Para Continuar Mañana**

1. **Abrir este archivo**: `DASHBOARD_PENDIENTES.md`
2. **Revisar logs del navegador** (F12 → Console)
3. **Empezar por el World Clock** (más fácil de debuggear)
4. **Seguir con GitHub Activity** (verificar repos existentes)
5. **Terminar con Catalog Widget** (más complejo)

---

**📅 Última actualización**: 10 Septiembre 2025  
**👤 Pendiente para**: Jaime Henao  
**🎯 Objetivo**: Dashboard funcionando completamente con datos reales y zonas horarias sudamericanas