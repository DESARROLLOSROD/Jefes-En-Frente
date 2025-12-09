# Plan de Mejoras - Aplicación Móvil
## Comparativa Web vs Mobile y Roadmap de Implementación

---

## 📊 Análisis Comparativo

### ✅ Funcionalidades Ya Implementadas en Mobile

| Funcionalidad | Web | Mobile | Estado |
|---------------|-----|--------|--------|
| Login con autenticación | ✅ | ✅ | ✅ Completo |
| Selección de proyectos | ✅ | ✅ | ✅ Completo |
| Dashboard principal | ✅ | ✅ | ✅ Completo |
| Crear reportes de actividades | ✅ | ✅ | ✅ Completo |
| Ver lista de reportes | ✅ | ✅ | ✅ Completo |
| Ver detalle de reportes | ✅ | ✅ | ✅ Completo |
| Gestión de usuarios | ✅ | ✅ | ✅ Completo |
| Gestión de vehículos | ✅ | ✅ | ✅ Completo |
| Gestión de proyectos | ✅ | ✅ | ✅ Completo |
| Gestión de zonas de trabajo | ✅ | ✅ | ✅ Completo |
| Control de sesión/logout | ✅ | ✅ | ✅ Completo |
| Mostrar/ocultar contraseña | ❌ | ✅ | ✅ Mejorado en mobile |

### ⚠️ Funcionalidades Parciales o Pendientes

| Funcionalidad | Web | Mobile | Gap |
|---------------|-----|--------|-----|
| **Formulario de reportes completo** | ✅ Multi-sección | ⚠️ Básico | Falta Control Acarreo, Material, Agua |
| **Mapa interactivo** | ✅ Pins múltiples | ⚠️ Limitado | Falta selector de pins en mapa |
| **Generación de PDFs** | ✅ 3 tipos | ⚠️ Básico | Solo PDFs simples |
| **Catálogos dinámicos** | ✅ Autocomplete | ❌ | Falta Material/Capacidad |
| **Editar reportes** | ✅ | ❌ | No implementado |
| **Eliminar reportes** | ✅ Confirmación | ❌ | No implementado |
| **Control de roles** | ✅ Completo | ⚠️ Parcial | Falta validación en todas las pantallas |
| **Timeout de sesión** | ✅ 15 min | ❌ | No implementado |
| **Reportes generales** | ✅ PDF | ❌ | No implementado |
| **Biblioteca de mapas** | ✅ | ❌ | No implementado |

### 🚀 Funcionalidades Únicas Potenciales para Mobile

| Funcionalidad | Prioridad | Ventaja |
|---------------|-----------|---------|
| **Captura de fotos** | 🔥 Alta | Documentar trabajos in-situ |
| **GPS automático** | 🔥 Alta | Ubicación precisa sin manual |
| **Modo offline** | 🔥 Alta | Trabajar sin conexión en minas |
| **Escaneo QR/Barcode** | 🟡 Media | Rápida selección de vehículos |
| **Notas de voz** | 🟡 Media | Observaciones rápidas |
| **Notificaciones push** | 🟢 Baja | Alertas de aprobaciones |

---

## 🎯 Plan de Mejoras por Prioridad

### 🔥 PRIORIDAD 1 - Paridad Funcional Crítica

#### 1.1 Formulario de Reportes Completo
**Objetivo:** Igualar funcionalidad del formulario web con las 3 secciones de control

**Cambios necesarios:**
- ✅ Información básica (ya existe)
- ➕ Control de Acarreo (material, viajes, capacidad, volumen)
- ➕ Control de Material (material, cantidad, zona, elevación)
- ➕ Control de Agua (vehículo, capacidad, volumen)
- ➕ Control de Maquinaria (horómetro inicial/final)
- ➕ Selector de pins en mapa (único o múltiples)

**Archivos a modificar:**
- `mobile/src/screens/reports/ReportFormScreen.tsx`
- Crear: `mobile/src/components/reports/ControlAcarreoSection.tsx`
- Crear: `mobile/src/components/reports/ControlMaterialSection.tsx`
- Crear: `mobile/src/components/reports/ControlAguaSection.tsx`
- Crear: `mobile/src/components/reports/ControlMaquinariaSection.tsx`

**Estimación:** 2-3 días

---

#### 1.2 Editar y Eliminar Reportes
**Objetivo:** Permitir edición y eliminación con confirmación

**Cambios necesarios:**
- ➕ Botón "Editar" en ReportDetailScreen
- ➕ Modal de confirmación para eliminar
- ➕ Validación de roles (solo admin/supervisor)
- ➕ Navegación a formulario pre-llenado

**Archivos a modificar:**
- `mobile/src/screens/reports/ReportDetailScreen.tsx`
- `mobile/src/screens/reports/ReportFormScreen.tsx`
- Crear: `mobile/src/components/modals/ConfirmationModal.tsx`

**Estimación:** 1 día

---

#### 1.3 Generación de PDFs Completos
**Objetivo:** PDFs profesionales con mapas, pins y todos los controles

**Cambios necesarios:**
- ➕ Integrar expo-print más jsPDF
- ➕ Template de PDF con logo y branding
- ➕ Incluir mapa con pins visualizados
- ➕ Todas las secciones de control
- ➕ Botón "Descargar PDF" en detalle

**Archivos a modificar:**
- Crear: `mobile/src/utils/pdfGenerator.ts`
- `mobile/src/screens/reports/ReportDetailScreen.tsx`

**Estimación:** 2 días

---

### 🟡 PRIORIDAD 2 - UX/UI Mobile-Optimizado

#### 2.1 Navegación Bottom Tab
**Objetivo:** Navegación nativa móvil más intuitiva

**Cambios necesarios:**
- ➕ Reemplazar Stack por Bottom Tabs para dashboard
- ➕ Iconos nativos (Ionicons/MaterialIcons)
- ➕ Badges para notificaciones
- ➕ Tabs: Dashboard, Reportes, Zonas, Admin (si aplica)

**Archivos a modificar:**
- `mobile/src/navigation/AppNavigator.tsx`
- Instalar: `@react-navigation/bottom-tabs`

**Estimación:** 1 día

---

#### 2.2 Diseño Visual Mejorado
**Objetivo:** UI moderna y consistente con paleta de colores web

**Cambios necesarios:**
- ➕ Sistema de diseño con componentes reutilizables
- ➕ Cards con sombras y elevación
- ➕ Animaciones suaves (react-native-reanimated)
- ➕ Skeleton loaders para carga
- ➕ Empty states con ilustraciones

**Archivos a crear:**
- `mobile/src/components/ui/Card.tsx`
- `mobile/src/components/ui/LoadingCard.tsx`
- `mobile/src/components/ui/EmptyState.tsx`
- `mobile/src/theme/colors.ts`
- `mobile/src/theme/spacing.ts`

**Estimación:** 2 días

---

#### 2.3 Timeout de Sesión
**Objetivo:** Auto-logout después de 15 min de inactividad

**Cambios necesarios:**
- ➕ Hook useInactivityTimeout
- ➕ Detector de eventos de interacción
- ➕ Modal de advertencia "Sesión por expirar"
- ➕ Limpieza de AsyncStorage al expirar

**Archivos a crear:**
- `mobile/src/hooks/useInactivityTimeout.ts`
- Modificar: `mobile/src/contexts/AuthContext.tsx`

**Estimación:** 1 día

---

### 🟢 PRIORIDAD 3 - Funcionalidades Mobile-Nativas

#### 3.1 Captura de Fotos
**Objetivo:** Documentar con fotos los reportes

**Cambios necesarios:**
- ➕ Botón "Agregar foto" en formulario
- ➕ Galería de fotos en reporte
- ➕ Compresión de imágenes
- ➕ Subida a backend (Base64 o S3)
- ➕ Visualización en detalle y PDF

**Dependencias:**
- `expo-image-picker` (ya instalado)
- `expo-image-manipulator` (para compresión)

**Archivos a crear:**
- `mobile/src/components/reports/PhotoPicker.tsx`
- `mobile/src/components/reports/PhotoGallery.tsx`
- `mobile/src/utils/imageCompressor.ts`

**Estimación:** 2 días

---

#### 3.2 Ubicación GPS Automática
**Objetivo:** Capturar coordenadas GPS reales

**Cambios necesarios:**
- ➕ Solicitar permisos de ubicación
- ➕ Capturar lat/lng al crear reporte
- ➕ Mostrar coordenadas en detalle
- ➕ Botón "Usar mi ubicación" en formulario

**Dependencias:**
- `expo-location`

**Archivos a crear:**
- `mobile/src/hooks/useLocation.ts`
- Modificar: `mobile/src/screens/reports/ReportFormScreen.tsx`

**Estimación:** 1 día

---

#### 3.3 Modo Offline
**Objetivo:** Trabajar sin conexión y sincronizar después

**Cambios necesarios:**
- ➕ Base de datos local (SQLite/WatermelonDB)
- ➕ Cola de sincronización
- ➕ Indicador de "offline"
- ➕ Sincronización automática al conectar
- ➕ Resolución de conflictos

**Dependencias:**
- `@react-native-async-storage/async-storage` (ya instalado)
- `@nozbe/watermelondb` o `expo-sqlite`
- `react-native-netinfo`

**Archivos a crear:**
- `mobile/src/database/schema.ts`
- `mobile/src/services/syncService.ts`
- `mobile/src/hooks/useNetworkStatus.ts`
- `mobile/src/utils/queueManager.ts`

**Estimación:** 5 días (complejo)

---

### 📋 PRIORIDAD 4 - Administración Avanzada

#### 4.1 Biblioteca de Mapas
**Objetivo:** Seleccionar mapas de biblioteca como en web

**Cambios necesarios:**
- ➕ Screen de biblioteca de mapas
- ➕ Grid de miniaturas
- ➕ Búsqueda y filtros
- ➕ Selector de mapa para proyecto

**Archivos a crear:**
- `mobile/src/screens/maps/MapLibraryScreen.tsx`
- `mobile/src/components/maps/MapGrid.tsx`

**Estimación:** 2 días

---

#### 4.2 Catálogos Dinámicos
**Objetivo:** Autocomplete con creación dinámica

**Cambios necesarios:**
- ➕ Componente AutocompleteInput
- ➕ API de materiales y capacidades
- ➕ Crear nuevo desde input
- ➕ Caché local de catálogos

**Archivos a crear:**
- `mobile/src/components/inputs/AutocompleteInput.tsx`
- `mobile/src/services/catalogService.ts`

**Estimación:** 2 días

---

## 🛠️ Resumen de Esfuerzo

| Prioridad | Funcionalidad | Días | Impacto |
|-----------|---------------|------|---------|
| 🔥 P1 | Formulario completo | 2-3 | Crítico |
| 🔥 P1 | Editar/Eliminar reportes | 1 | Crítico |
| 🔥 P1 | PDFs completos | 2 | Alto |
| 🟡 P2 | Bottom tabs | 1 | Medio |
| 🟡 P2 | UI mejorada | 2 | Medio |
| 🟡 P2 | Timeout sesión | 1 | Medio |
| 🟢 P3 | Fotos | 2 | Alto |
| 🟢 P3 | GPS | 1 | Medio |
| 🟢 P3 | Modo offline | 5 | Alto |
| 📋 P4 | Biblioteca mapas | 2 | Bajo |
| 📋 P4 | Catálogos | 2 | Medio |
| **TOTAL** | | **21-22 días** | |

---

## 🎨 Mejoras de Diseño Específicas

### Colores y Estilo (Replicar de Web)

```typescript
// mobile/src/constants/theme.ts
export const THEME = {
  colors: {
    primary: '#f97316',      // Orange (principal)
    secondary: '#1e40af',    // Blue (header)
    success: '#10b981',      // Green
    danger: '#ef4444',       // Red
    warning: '#f59e0b',      // Yellow
    info: '#3b82f6',         // Light blue
    cyan: '#06b6d4',         // Cyan (agua)
    background: '#f9fafb',   // Light gray
    surface: '#ffffff',      // White cards
    border: '#e5e7eb',       // Gray border
    text: '#1f2937',         // Dark gray
    textSecondary: '#6b7280' // Medium gray
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    }
  }
};
```

### Componentes a Crear

1. **Card Component**
```typescript
// Tarjetas con elevación y estilo consistente
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Content>Contenido</Card.Content>
  <Card.Actions>Botones</Card.Actions>
</Card>
```

2. **Button Component**
```typescript
// Botones con variantes
<Button variant="primary" size="lg" icon="📄">
  Generar PDF
</Button>
```

3. **Input Component**
```typescript
// Inputs estilizados con labels
<Input
  label="Email"
  placeholder="correo@ejemplo.com"
  leftIcon="📧"
  error="Campo requerido"
/>
```

---

## ✅ Siguiente Paso Recomendado

**Implementar primero:**
1. ✅ **Ya hecho**: Login con mostrar/ocultar password
2. 🔥 **Siguiente**: Formulario de reportes completo (Control Acarreo, Material, Agua)
3. 🔥 **Después**: Editar y eliminar reportes

**¿Quieres que comience con el formulario de reportes completo?**

---

## 📝 Notas de Implementación

- Mantener compatibilidad con backend existente
- Agregar tests unitarios para nuevas funcionalidades
- Documentar cambios en CHANGELOG.md
- Considerar i18n para futuro multi-idioma
- Optimizar rendimiento en listas largas (FlatList con virtualización)
- Implementar error boundaries en todas las pantallas críticas
