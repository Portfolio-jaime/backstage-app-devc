# 📚 Documentación del Sistema de Temas Dinámicos para Backstage

## 📋 Descripción General

El Sistema de Temas Dinámicos permite a los usuarios personalizar la apariencia visual de los dashboards de Backstage según sus preferencias. Cada dashboard puede tener temas específicos optimizados para su función, y los usuarios pueden cambiar entre temas en tiempo real.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── hooks/
│   └── useDynamicTheme.tsx         # Hook principal y provider de temas
├── components/home/
│   ├── ThemeSelector.tsx           # Selector de temas con interfaz
│   └── HomePage.tsx                # Integración en dashboard
└── App.tsx                         # Configuración raíz
```

## 🎨 Características Implementadas

### ✅ Funcionalidades Principales

- **8 Temas Predefinidos** con variantes light/dark
- **Temas Específicos por Dashboard** (DevOps, Security, Platform)
- **Persistencia en LocalStorage** de preferencias de usuario
- **Preview en Tiempo Real** antes de aplicar temas
- **Compatibilidad Completa** con el sistema existente de Backstage
- **Toggle Dark/Light Mode** independiente
- **Filtros por Categoría** y dashboard específico

### 🎯 Temas Disponibles

#### Temas Generales
```typescript
- ba-classic-light    // Tema clásico BA claro
- ba-classic-dark     // Tema clásico BA oscuro
- midnight-blue       // Tema azul nocturno
- golden-hour         // Tema cálido atardecer
```

#### Temas DevOps Dashboard
```typescript
- devops-terminal     // Negro/cyan techie
- devops-matrix       // Verde matrix hacker
- devops-classic-light // Clásico DevOps claro
```

#### Temas Especializados
```typescript
- security-alert      // Rojo/alerta para Security
- platform-enterprise // Verde corporativo para Platform
```

## 🛠️ Implementación Técnica

### Hook Principal: `useDynamicTheme.tsx`

```typescript
// Interfaz principal del tema
export interface CustomThemeConfig {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    card: string;
    border: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  category: 'default' | 'dashboard-specific' | 'seasonal' | 'custom';
  forDashboards?: string[];
}
```

### Context de Temas

```typescript
interface ThemeContextType {
  currentTheme: CustomThemeConfig;
  availableThemes: CustomThemeConfig[];
  materialTheme: Theme;
  changeTheme: (themeId: string) => void;
  getThemesForDashboard: (dashboardId: string) => CustomThemeConfig[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}
```

### Componente Selector: `ThemeSelector.tsx`

```typescript
interface ThemeSelectorProps {
  currentDashboard?: string;  // Dashboard actual para filtrar temas
  compact?: boolean;          // Versión compacta o completa
}
```

## 🚀 Uso e Integración

### 1. Configuración en App.tsx

```typescript
import DynamicThemeProvider from './hooks/useDynamicTheme';

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <DynamicThemeProvider>
        <Root>{routes}</Root>
      </DynamicThemeProvider>
    </AppRouter>
  </>,
);
```

### 2. Uso en Componentes

```typescript
import { useDynamicTheme } from '../../hooks/useDynamicTheme';

const MyComponent = () => {
  const { 
    currentTheme, 
    changeTheme, 
    isDarkMode, 
    toggleDarkMode 
  } = useDynamicTheme();
  
  return (
    <div style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Tu contenido aquí */}
    </div>
  );
};
```

### 3. Selector de Temas

```typescript
import { ThemeSelector } from './ThemeSelector';

// Versión completa
<ThemeSelector currentDashboard="ba-devops" />

// Versión compacta
<ThemeSelector currentDashboard="ba-devops" compact={true} />
```

## 📁 Configuración YAML de Temas

### Estructura en Dashboard Config

```yaml
theme:
  # Tema por defecto
  default:
    primaryColor: "#1976d2"
    secondaryColor: "#ff9800"
    light:
      backgroundColor: "#f5f5f5"
      surfaceColor: "#ffffff"
      textColor: "#333333"
    dark:
      backgroundColor: "#121212"
      surfaceColor: "#1e1e1e"
      textColor: "#ffffff"
  
  # Temas disponibles
  availableThemes:
    - id: "devops-terminal"
      name: "DevOps Terminal"
      description: "Tema oscuro inspirado en terminales"
      type: "dark"
      colors:
        primary: "#00d9ff"
        secondary: "#ff6b35"
        background: "#0a0a0a"
        surface: "#1a1a2e"
        text: "#eee6e6"
        card: "#16213e"
        border: "#0f3460"
      category: "dashboard-specific"
  
  # Configuración del selector
  themeSelector:
    enabled: true
    allowUserCustomization: true
    autoSwitchByDashboard: true
    position: "dashboard-header"
```

## 💾 Persistencia de Datos

### LocalStorage Keys

```typescript
// Tema seleccionado por el usuario
'backstage-custom-theme': string

// Modo oscuro/claro
'backstage-custom-dark-mode': boolean
```

### Comportamiento de Persistencia

1. **Carga Inicial**: Lee preferencias guardadas del localStorage
2. **Cambio de Tema**: Guarda automáticamente la nueva selección
3. **Toggle Dark/Light**: Persiste la preferencia de modo
4. **Independiente**: No interfiere con las preferencias nativas de Backstage

## 🎨 Diseño del Selector de Temas

### Interfaz Completa

- **Header**: Título y controles principales
- **Dark Mode Toggle**: Switch para cambiar entre claro/oscuro
- **Filtros**: Por categoría y dashboard específico
- **Grid de Temas**: Vista previa visual de cada tema
- **Preview Section**: Demostración en tiempo real

### Interfaz Compacta

- **Theme Info**: Información del tema actual
- **Quick Toggle**: Botón para modo oscuro/claro
- **Browse Button**: Acceso al selector completo

## 🔧 Personalización y Extensión

### Agregar Nuevos Temas

1. **Definir el tema** en `SYSTEM_THEMES` array:

```typescript
{
  id: 'mi-tema-personalizado',
  name: 'Mi Tema Personalizado',
  description: 'Descripción del tema',
  type: 'dark',
  colors: {
    primary: '#color1',
    secondary: '#color2',
    // ... más colores
  },
  category: 'custom',
  forDashboards: ['mi-dashboard'],
}
```

2. **Actualizar configuración YAML** del dashboard correspondiente

3. **Probar el tema** usando el selector

### Crear Temas Específicos por Dashboard

```typescript
// En el array SYSTEM_THEMES
{
  id: 'mi-dashboard-tema',
  name: 'Tema para Mi Dashboard',
  // ...
  forDashboards: ['mi-dashboard-id'],
}
```

## 🛡️ Compatibilidad y Limitaciones

### ✅ Compatible Con

- **Backstage Core Components**: Sidebar, InfoCard, etc.
- **Material-UI Components**: Buttons, Cards, Typography
- **Existing Themes**: No interfiere con temas nativos
- **Dark/Light Mode**: Respeta preferencias del sistema

### ⚠️ Limitaciones

- **Componentes Externos**: Algunos plugins pueden no responder a cambios
- **CSS Custom**: Estilos hardcodeados no se actualizan
- **Performance**: Cambios de tema requieren re-render

## 🐛 Troubleshooting

### Problemas Comunes

**1. Tema no se aplica**
```typescript
// Verificar que el tema existe
const availableThemes = getThemesForDashboard('mi-dashboard');
console.log(availableThemes);
```

**2. Error de importación**
```typescript
// Usar la importación correcta
import { useDynamicTheme } from '../../hooks/useDynamicTheme';
import DynamicThemeProvider from '../../hooks/useDynamicTheme';
```

**3. LocalStorage no persiste**
```typescript
// Verificar claves correctas
localStorage.getItem('backstage-custom-theme');
localStorage.getItem('backstage-custom-dark-mode');
```

## 📊 Métricas y Analíticas

### Logging del Sistema

```typescript
// Cambios de tema se registran en consola
console.log(`🎨 Theme changed to: ${themeId}`);

// Estado actual del tema
console.log('Current theme:', currentTheme);
```

### Datos de Uso

- **Tema más popular**: Tracking en localStorage
- **Preferencia dark/light**: Porcentaje de usuarios
- **Temas por dashboard**: Uso específico por área

## 🔄 Roadmap y Mejoras Futuras

### Versión 2.0 (Planeada)

- [ ] **Editor de Temas Visual**: Crear temas personalizados desde UI
- [ ] **Importar/Exportar Temas**: Compartir configuraciones
- [ ] **Temas Temporales**: Automáticos por hora/estación
- [ ] **Sincronización**: Temas compartidos entre usuarios
- [ ] **Themes API**: Endpoint para gestión de temas
- [ ] **A/B Testing**: Pruebas de usabilidad de temas

### Mejoras Técnicas

- [ ] **Lazy Loading**: Cargar temas bajo demanda
- [ ] **CSS Variables**: Mejor performance de cambios
- [ ] **Theme Validation**: Validación de esquemas
- [ ] **Accessibility**: Mejores contrastes y accesibilidad

---

## 📞 Soporte y Contacto

**Desarrollador**: Jaime Henao  
**Email**: jaime.andres.henao.arbelaez@ba.com  
**Proyecto**: BA Backstage Dashboard System  
**Versión**: 1.0.0  
**Última actualización**: Enero 2025

### 🤝 Contribuciones

Para contribuir al sistema de temas:

1. **Fork** el repositorio
2. **Crear branch** para tu feature
3. **Implementar** mejoras siguiendo patrones existentes
4. **Probar** con diferentes dashboards
5. **Crear PR** con descripción detallada

¡El sistema está listo para usar y extender! 🎨✨