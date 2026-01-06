# Historial de Modificaciones de Reportes

## Descripción

El sistema ahora incluye un historial completo de todas las modificaciones realizadas a los reportes de actividades. Esta funcionalidad permite rastrear quién modificó un reporte, cuándo se realizó el cambio y qué campos fueron actualizados.

## Características Principales

### 1. Registro Automático de Modificaciones
- Cada vez que un administrador o supervisor edita un reporte, se registra automáticamente:
  - **Fecha y hora** de la modificación
  - **Usuario** que realizó el cambio (ID y nombre)
  - **Lista detallada de cambios** mostrando el valor anterior y el nuevo valor de cada campo modificado
  - **Observación opcional** que el usuario puede agregar al momento de modificar

### 2. Visualización del Historial
- **Botón "HISTORIAL"** disponible en la lista de reportes para todos los usuarios
- **Modal intuitivo** que muestra todas las modificaciones en orden cronológico
- **Formato visual claro** con códigos de colores:
  - Rojo para valores anteriores
  - Verde para valores nuevos

### 3. Información Detallada
El historial registra cambios en todos los campos del reporte:
- Fecha, ubicación, turno
- Horarios de actividades
- Zona y sección de trabajo
- Jefe en frente y sobrestante
- Control de acarreo, material, agua y maquinaria
- Observaciones
- Pins en el mapa

## Uso

### Para Administradores y Supervisores

#### Al Modificar un Reporte:
1. Haz clic en el botón "EDITAR" del reporte que deseas modificar
2. Realiza los cambios necesarios en el formulario
3. (Opcional) Agrega una observación sobre la modificación en el campo `observacionModificacion`
4. Guarda los cambios
5. El sistema registrará automáticamente todos los cambios en el historial

**Ejemplo de observación:**
```
"Corrección de horas de maquinaria por error en horómetro"
```

#### Al Ver el Historial:
1. En la lista de reportes, haz clic en el botón "HISTORIAL"
2. Se abrirá un modal mostrando todas las modificaciones
3. Cada modificación muestra:
   - Nombre del usuario que modificó
   - Fecha y hora exacta
   - Número de cambios realizados
   - Observación (si la hay)
   - Comparación lado a lado del valor anterior vs nuevo valor

### Para Operadores (Jefe en Frente)

Los operadores pueden:
- Ver el historial de modificaciones de cualquier reporte
- Verificar qué cambios se han realizado
- Revisar quién y cuándo modificó un reporte

**Nota:** Los operadores NO pueden editar reportes, solo visualizar el historial.

## Implementación Técnica

### Backend

#### Modelo de Datos
Se agregó el campo `historialModificaciones` al modelo `ReporteActividades`:

```typescript
historialModificaciones?: Array<{
  fechaModificacion: Date;
  usuarioId: string;
  usuarioNombre: string;
  cambios: Array<{
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
  }>;
  observacion?: string;
}>;
```

#### Endpoint Nuevo
- **GET** `/api/reportes/:id/historial` - Obtiene el historial completo de un reporte

#### Modificación de Endpoints Existentes
- **PUT** `/api/reportes/:id` - Ahora registra automáticamente los cambios en el historial

### Frontend

#### Componentes Nuevos
- `HistorialModificaciones.tsx` - Modal para visualizar el historial de modificaciones

#### Componentes Modificados
- `ListaReportes.tsx` - Agregado botón de historial
- Tipos TypeScript actualizados en `reporte.ts`

## Ejemplos de Uso

### Escenario 1: Corrección de Error
Un supervisor nota que las horas de operación de una maquinaria están incorrectas:

1. Edita el reporte desde la lista
2. Corrige las horas en el control de maquinaria
3. Agrega la observación: "Corrección de horómetro inicial - lectura incorrecta"
4. Guarda los cambios
5. El historial registrará el cambio con la observación

### Escenario 2: Revisión de Cambios
Un administrador quiere verificar qué cambios se hicieron a un reporte específico:

1. Abre la lista de reportes
2. Hace clic en "HISTORIAL" del reporte en cuestión
3. Visualiza:
   - Quién hizo los cambios
   - Cuándo se realizaron
   - Qué campos específicos fueron modificados
   - Los valores antes y después del cambio

### Escenario 3: Auditoría
Se necesita auditar las modificaciones de un proyecto:

1. Revisa los reportes del proyecto
2. Consulta el historial de cada reporte relevante
3. Identifica patrones de correcciones frecuentes
4. Toma acciones correctivas según sea necesario

## Ventajas del Sistema

1. **Trazabilidad Completa**: Registro detallado de todos los cambios
2. **Transparencia**: Todos los usuarios pueden ver el historial
3. **Auditoría**: Facilita la revisión y control de calidad
4. **Responsabilidad**: Cada cambio está vinculado a un usuario específico
5. **Documentación**: Las observaciones permiten explicar el motivo de los cambios

## Notas Importantes

- El historial NO se elimina al borrar un reporte (el reporte completo se elimina)
- Los cambios se detectan automáticamente comparando valores
- Los arrays y objetos complejos se registran como "N elemento(s)" para facilitar la lectura
- El historial se ordena cronológicamente (más reciente primero)
- No hay límite en la cantidad de modificaciones que se pueden registrar

## Soporte

Para cualquier pregunta o problema relacionado con el historial de modificaciones, contacta al equipo de desarrollo.
