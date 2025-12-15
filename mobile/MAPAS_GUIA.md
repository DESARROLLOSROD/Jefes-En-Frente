# 🗺️ Mapas de Proyectos - Guía Completa

## 📅 Fecha de implementación
Diciembre 15, 2025

## ✅ Implementación Completa

La funcionalidad de **Mapas de Proyectos** ha sido completamente implementada permitiendo visualizar mapas de cada proyecto y colocar pins para marcar ubicaciones de trabajo.

---

## 🚀 **Características Implementadas**

### **1. Visualización de Mapas del Proyecto**
- ✅ Componente ProjectMap para renderizar imágenes de mapas
- ✅ Zoom y navegación en el mapa
- ✅ Soporte para imágenes en base64
- ✅ Información del proyecto integrada
- ✅ Manejo de proyectos sin mapa

### **2. Sistema de Pins**
- ✅ Colocación interactiva de pins en el mapa
- ✅ Etiquetas personalizadas para cada pin
- ✅ Colores configurables por pin
- ✅ Eliminación de pins con confirmación
- ✅ Persistencia de pins en reportes
- ✅ Contador de pins

### **3. Integración con Reportes**
- ✅ ReportMapPicker para agregar ubicaciones a reportes
- ✅ Modal fullscreen con mapa interactivo
- ✅ Lista de pins agregados
- ✅ Edición y eliminación de pins desde el reporte

### **4. Pantallas Nuevas**
- ✅ ProjectDetailScreen con vista completa del mapa
- ✅ Navegación desde ProjectSelectionScreen
- ✅ Badge visual para proyectos con mapa

---

## 📦 **Componentes Creados**

### **1. ProjectMap**
📁 `src/components/ProjectMap.tsx`

**Características:**
- Renderiza el mapa del proyecto desde imagen base64
- Permite colocar pins de manera interactiva
- Modo editable/no editable
- Controles opcionales (agregar pin, contador)
- Responsive al tema (Dark Mode)

**Props:**
```typescript
interface ProjectMapProps {
  proyecto: Proyecto;           // Proyecto con mapa
  pins?: PinMapa[];            // Pins a mostrar
  onPinAdd?: (pin: Omit<PinMapa, 'id'>) => void;  // Callback al agregar pin
  onPinRemove?: (pinId: string) => void;          // Callback al eliminar pin
  editable?: boolean;          // Si se pueden agregar/eliminar pins
  showControls?: boolean;      // Mostrar controles superiores
}
```

**Uso básico:**
```typescript
import ProjectMap from '../components/ProjectMap';

<ProjectMap
  proyecto={selectedProject}
  pins={pins}
  onPinAdd={(pin) => {
    const newPin = { ...pin, id: generateId() };
    setPins([...pins, newPin]);
  }}
  onPinRemove={(pinId) => {
    setPins(pins.filter(p => p.id !== pinId));
  }}
  editable={true}
  showControls={true}
/>
```

### **2. ReportMapPicker**
📁 `src/components/ReportMapPicker.tsx`

**Características:**
- Componente todo-en-uno para reportes
- Botón para abrir modal con mapa
- Lista de pins agregados
- Gestión completa de pins
- Themed

**Props:**
```typescript
interface ReportMapPickerProps {
  pins: PinMapa[];
  onPinsChange: (pins: PinMapa[]) => void;
}
```

**Integración en formularios:**
```typescript
import ReportMapPicker from '../components/ReportMapPicker';
import { PinMapa } from '../types';

const ReportForm = () => {
  const [pinesMapa, setPinesMapa] = useState<PinMapa[]>([]);

  return (
    <ScrollView>
      {/* Otros campos del formulario */}

      <ReportMapPicker
        pins={pinesMapa}
        onPinsChange={setPinesMapa}
      />

      {/* Más campos */}
    </ScrollView>
  );
};
```

### **3. ProjectDetailScreen**
📁 `src/screens/projects/ProjectDetailScreen.tsx`

**Características:**
- Vista completa del proyecto
- Información detallada (nombre, ubicación, descripción, estado)
- Mapa del proyecto en vista de solo lectura
- Navegación desde ProjectSelectionScreen

**Navegación:**
```typescript
navigation.navigate('ProjectDetail', { proyecto: proyecto });
```

---

## 🔧 **Archivos Modificados**

### **1. ProjectSelectionScreen**
**Cambios realizados:**
- ✅ Actualizado a usar `useTheme()` (Dark Mode compatible)
- ✅ Agregado badge de mapa para proyectos que tienen mapa
- ✅ Dialog de opciones al tocar proyecto
  - "Ver Detalles y Mapa"
  - "Seleccionar Proyecto"
- ✅ Iconos mejorados con Ionicons
- ✅ Mejor UI con diseño moderno

### **2. AppNavigator**
**Cambios realizados:**
- ✅ Agregada ruta `ProjectDetail`
- ✅ Importado `ProjectDetailScreen`
- ✅ Actualizado `RootStackParamList` con parámetros de proyecto

```typescript
export type RootStackParamList = {
  // ...
  ProjectDetail: { proyecto: Proyecto };
  // ...
};
```

---

## 📖 **Cómo Usar los Mapas**

### **1. Ver Mapa de un Proyecto**

**Para Usuarios:**
1. En la pantalla de selección de proyectos
2. Presionar sobre un proyecto que tenga el badge de mapa (ícono verde)
3. Seleccionar "Ver Detalles y Mapa"
4. Se abre la pantalla con toda la información y el mapa

### **2. Agregar Ubicaciones en Reportes**

**Para Usuarios:**
1. Al crear o editar un reporte
2. Buscar la sección "Ubicación en el Mapa"
3. Presionar el botón del mapa
4. En el modal del mapa:
   - Presionar "Agregar Pin"
   - Tocar en el mapa donde se realizó el trabajo
   - Ingresar una etiqueta (ej: "Excavación Zona A")
   - Repetir para agregar más ubicaciones
5. Presionar "Listo" para cerrar el mapa
6. Los pins aparecerán en la lista debajo del botón

### **3. Eliminar Pins**

**Opción A - Desde la lista:**
1. En la lista de pins, presionar el ícono de eliminar (X roja)

**Opción B - Desde el mapa:**
1. Abrir el modal del mapa
2. Tocar sobre un pin existente
3. Seleccionar "Eliminar" en el diálogo

---

## 🎯 **Flujo de Trabajo**

### **Escenario 1: Supervisor Crea Reporte con Ubicaciones**

1. Usuario abre formulario de nuevo reporte
2. Completa información básica (fecha, turno, etc.)
3. Presiona el botón "Ubicación en el Mapa"
4. Se abre modal con el mapa del proyecto
5. Presiona "Agregar Pin"
6. Toca en el mapa donde excavó: "Excavación Norte"
7. Presiona "Agregar Pin" nuevamente
8. Toca donde hizo relleno: "Relleno Zona B"
9. Presiona "Listo"
10. Ve la lista de 2 pins agregados
11. Completa el resto del formulario
12. Guarda el reporte
13. Los pins se guardan con el reporte en la base de datos

### **Escenario 2: Admin Consulta Mapa de Proyecto**

1. Admin en pantalla de selección de proyectos
2. Ve que "Proyecto Mina Norte" tiene badge de mapa
3. Presiona sobre el proyecto
4. Selecciona "Ver Detalles y Mapa"
5. Ve toda la información del proyecto
6. Scroll hacia abajo para ver el mapa completo
7. Puede hacer zoom/pan en el mapa
8. Regresa a la lista de proyectos

---

## 📱 **Integración en ReportFormEnhanced**

Para integrar el mapa en el formulario de reportes:

```typescript
import React, { useState } from 'react';
import ReportMapPicker from '../../components/ReportMapPicker';
import { PinMapa } from '../../types';

const ReportFormEnhanced = () => {
  // ... otros estados

  const [pinesMapa, setPinesMapa] = useState<PinMapa[]>([]);

  const handleSubmit = async () => {
    const reportData: ReporteActividades = {
      // ... otros campos
      pinesMapa: pinesMapa,
      // ...
    };

    await ApiService.createReporte(reportData);
  };

  return (
    <ScrollView>
      {/* Información Básica */}
      <Card title="Información Básica">
        {/* Campos existentes */}
      </Card>

      {/* Ubicación en el Mapa */}
      <Card title="Ubicación">
        <ReportMapPicker
          pins={pinesMapa}
          onPinsChange={setPinesMapa}
        />
      </Card>

      {/* Controles */}
      <Card title="Controles">
        {/* Controles existentes */}
      </Card>

      <Button title="Guardar Reporte" onPress={handleSubmit} />
    </ScrollView>
  );
};
```

---

## 🎨 **Personalización**

### **Cambiar Color de Pins Nuevos**

```typescript
// En ProjectMap.tsx
const newPin: Omit<PinMapa, 'id'> = {
  pinX,
  pinY,
  etiqueta: etiqueta.trim(),
  color: theme.success,  // Cambiar a theme.warning, theme.danger, etc.
};
```

### **Cambiar Tamaño de Pins**

```typescript
// En ProjectMap.tsx styles
pin: {
  width: 40,      // Cambiar de 30 a 40
  height: 40,     // Cambiar de 30 a 40
  borderRadius: 20,  // La mitad del width/height
  // ...
}
```

### **Personalizar Etiquetas**

```typescript
// En ProjectMap.tsx
Alert.prompt(
  'Nueva Ubicación',  // Cambiar título
  'Describe el trabajo realizado aquí:',  // Cambiar mensaje
  // ...
);
```

---

## 📊 **Estructura de Datos**

### **PinMapa Interface**

```typescript
export interface PinMapa {
  id: string;        // ID único del pin
  pinX: number;      // Coordenada X (0-100%)
  pinY: number;      // Coordenada Y (0-100%)
  etiqueta: string;  // Etiqueta descriptiva
  color: string;     // Color hex del pin
}
```

### **Proyecto con Mapa**

```typescript
export interface Proyecto {
  _id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
  mapa?: {
    imagen: {
      data: string;        // Base64 data
      contentType: string; // 'image/png', 'image/jpeg'
    };
    width: number;
    height: number;
  };
}
```

### **ReporteActividades con Pins**

```typescript
export interface ReporteActividades {
  // ... otros campos
  pinesMapa: PinMapa[];  // Array de pins colocados
  // ...
}
```

---

## 🐛 **Troubleshooting**

### **Problema: Mapa no se ve**
**Solución:**
- Verificar que el proyecto tenga el campo `mapa` con datos
- Verificar que la imagen esté en formato base64 válido
- Revisar que `contentType` sea correcto ('image/png' o 'image/jpeg')

### **Problema: No se puede agregar pins**
**Solución:**
- Verificar que `editable={true}` esté configurado
- Verificar que las funciones `onPinAdd` y `onPinRemove` estén definidas
- Revisar permisos en el componente padre

### **Problema: Los pins no aparecen en la posición correcta**
**Solución:**
- Verificar que las coordenadas `pinX` y `pinY` estén en el rango 0-100
- Asegurarse de que `mapDimensions` se haya calculado correctamente
- Revisar que la imagen del mapa se haya cargado completamente

### **Problema: El modal no se cierra**
**Solución:**
- Verificar que `onRequestClose` esté definido
- Revisar que el botón "Listo" tenga el `onPress` correcto
- En Android, presionar el botón físico de "back"

---

## 💡 **Best Practices**

1. **Siempre validar que el proyecto tenga mapa** antes de mostrar opciones de mapa
2. **Usar etiquetas descriptivas** en los pins (ej: "Excavación Zona A", no solo "Pin 1")
3. **Limitar la cantidad de pins** por reporte (máximo 5-10 para mantener claridad)
4. **Dar feedback visual** al usuario cuando coloca/elimina pins
5. **Persistir los pins** en el backend junto con el reporte
6. **Verificar coordenadas** antes de guardar (0-100 rango válido)
7. **Usar colores consistentes** para tipos de trabajo similares
8. **Comprimir imágenes** de mapas en el backend para mejor rendimiento

---

## 🔐 **Permisos**

No se requieren permisos especiales del sistema para usar mapas de imagen.

**Nota:** Si en el futuro se integra con mapas reales (Google Maps, etc.), se requerirán permisos de ubicación.

---

## 🚀 **Próximos Pasos (Opcionales)**

### **Mejoras Avanzadas:**

1. **Categorías de Pins** 🏷️
   - Diferentes tipos: Excavación, Relleno, Maquinaria, Problema
   - Colores automáticos por categoría
   - Iconos personalizados por tipo

2. **Mediciones en el Mapa** 📏
   - Medir distancias entre puntos
   - Calcular áreas
   - Mostrar escala del mapa

3. **Fotos Geolocalizadas** 📸
   - Asociar fotos de evidencia a pins específicos
   - Ver fotos al tocar un pin
   - Galería de fotos por ubicación

4. **Timeline de Actividades** ⏱️
   - Ver todos los reportes en un solo mapa
   - Filtrar por fechas
   - Animación de progreso del proyecto

5. **Exportar Mapa** 📤
   - Generar PDF con mapa y pins
   - Incluir en reportes impresos
   - Compartir imagen del mapa

6. **Integración GPS** 🛰️
   - Colocar pin automático en ubicación actual
   - Tracking de ruta de vehículos
   - Verificación de ubicación real vs reportada

7. **Capas del Mapa** 🗺️
   - Múltiples mapas por proyecto (diferentes vistas)
   - Overlay de planos/diseños
   - Comparación antes/después

---

## 📚 **Dependencias Utilizadas**

```json
{
  "react-native": "^0.76.5",
  "@expo/vector-icons": "^14.0.0"
}
```

**Nota:** No se usó `react-native-maps` tradicional porque los mapas son imágenes personalizadas del proyecto, no mapas geográficos.

---

## 🎯 **Beneficios**

### **Para Jefes en Frente:**
- ✅ Marcar exactamente dónde trabajaron
- ✅ Documentación visual precisa
- ✅ Múltiples ubicaciones en un reporte
- ✅ Comunicación clara con supervisores

### **Para Supervisores:**
- ✅ Ver ubicaciones de trabajo de un vistazo
- ✅ Validar que el trabajo se hizo donde corresponde
- ✅ Mejor control de avance del proyecto
- ✅ Informes más precisos

### **Para Administradores:**
- ✅ Vista general del proyecto
- ✅ Análisis de zonas más activas
- ✅ Planificación basada en ubicaciones reales
- ✅ Reportes con información geoespacial

---

## 📐 **Arquitectura**

```
┌─────────────────────────────────────┐
│   ReportFormEnhanced                │
│   ┌─────────────────────────────┐   │
│   │   ReportMapPicker           │   │
│   │   ┌─────────────────────┐   │   │
│   │   │   ProjectMap        │   │   │
│   │   │   - Renderiza mapa  │   │   │
│   │   │   - Gestiona pins   │   │   │
│   │   │   - Interacción     │   │   │
│   │   └─────────────────────┘   │   │
│   │   - Modal                   │   │
│   │   - Lista de pins           │   │
│   │   - Botón abrir mapa        │   │
│   └─────────────────────────────┘   │
│   - Estado pinesMapa[]              │
│   - Envío al backend                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   ProjectDetailScreen               │
│   ┌─────────────────────────────┐   │
│   │   ProjectMap                │   │
│   │   - Modo solo lectura       │   │
│   │   - Sin interacción         │   │
│   └─────────────────────────────┘   │
│   - Información del proyecto        │
└─────────────────────────────────────┘
```

---

## ✅ **Resumen**

La funcionalidad de **Mapas de Proyectos** está **completamente implementada** con:

- ✅ Componente ProjectMap reutilizable
- ✅ ReportMapPicker para reportes
- ✅ ProjectDetailScreen con mapa completo
- ✅ Sistema de pins interactivo
- ✅ Integración con Dark Mode
- ✅ Responsive y themed
- ✅ Navegación completa
- ✅ Documentación completa

**Siguiente paso:** Integrar `ReportMapPicker` en `ReportFormEnhanced` para que los usuarios puedan marcar ubicaciones al crear reportes.

---

## 🔗 **Archivos Relacionados**

- [src/components/ProjectMap.tsx](src/components/ProjectMap.tsx) - Componente principal de mapa
- [src/components/ReportMapPicker.tsx](src/components/ReportMapPicker.tsx) - Selector de mapa para reportes
- [src/screens/projects/ProjectDetailScreen.tsx](src/screens/projects/ProjectDetailScreen.tsx) - Pantalla de detalles con mapa
- [src/screens/projects/ProjectSelectionScreen.tsx](src/screens/projects/ProjectSelectionScreen.tsx) - Pantalla de selección (actualizada)
- [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx) - Navegación (actualizada)
- [src/types/index.ts](src/types/index.ts) - Tipos de datos (PinMapa, Proyecto)

---

**¡Los mapas de proyectos están listos para usar! 🗺️✨**
