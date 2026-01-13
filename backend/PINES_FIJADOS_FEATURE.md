# Feature: Pines Fijados para Mediciones de Mapa

## Descripción
Esta funcionalidad permite marcar pines en el mapa como "fijados" para usarlos como puntos de referencia precisos al tomar mediciones. Los usuarios pueden ahora:

1. **Fijar/Desfijar pines**: Marcar pines específicos como puntos de referencia permanentes
2. **Mediciones precisas**: Tomar medidas exactas entre pines fijados
3. **Indicadores visuales**: Identificar fácilmente qué pines están fijados

## Cambios Realizados

### Frontend (`frontend/src/components/mapas/MapaConAnotaciones.tsx`)

#### 1. Interfaz Pin Actualizada
```typescript
interface Pin {
  id: string;
  pinX: number;
  pinY: number;
  etiqueta: string;
  color?: string;
  fijado?: boolean;  // ✨ NUEVO
}
```

#### 2. Nuevas Funcionalidades

**Fijar/Desfijar Pines:**
- Doble-click en un pin para fijarlo/desfijarlo
- Botón dedicado en la barra de selección: "📌 FIJAR" / "📌 DESFIJAR"

**Modo Selección de Pines para Medidas:**
- Botón "📍 USAR PINES FIJOS" aparece cuando hay pines fijados
- Permite seleccionar dos pines fijos para crear una medición precisa
- Click en primer pin fijo → Click en segundo pin fijo → Medida creada

#### 3. Indicadores Visuales

**Pin Fijado:**
- Círculo central relleno del color del pin
- Emoji 📌 en el pin
- "📌" en el tooltip al hacer hover

**Modo Selección Activo:**
- Pines fijados con anillo amarillo (`ring-4 ring-yellow-400`)
- Pin seleccionado con anillo verde (`ring-4 ring-green-500`)
- Mensajes informativos en panel de herramientas

### Backend

#### 1. Base de Datos (`backend/supabase_pines_fijados_migration.sql`)
```sql
ALTER TABLE pines_mapa
ADD COLUMN IF NOT EXISTS fijado BOOLEAN DEFAULT FALSE;
```

**Migración:**
- Ejecutar este SQL en Supabase para agregar la columna `fijado`
- Valor por defecto: `FALSE`
- Compatibilidad: pines existentes no estarán fijados por defecto

#### 2. Tipos TypeScript (`backend/src/types/database.types.ts`)
```typescript
export interface PinMapa {
  id: string;
  reporte_id: string;
  pin_id: string;
  pin_x: number;
  pin_y: number;
  etiqueta?: string;
  color?: string;
  fijado?: boolean;  // ✨ NUEVO
}
```

#### 3. Servicio de Reportes
- **Sin cambios necesarios**: El servicio ya usa spread operators (`...item`) que incluyen automáticamente todos los campos
- `insertPinesMapa()`: Inserta el campo `fijado` automáticamente
- `getPinesMapa()`: Recupera el campo `fijado` con `SELECT *`

## Uso

### 1. Fijar un Pin

**Método 1: Doble-click**
1. Coloca un pin en el mapa
2. Haz doble-click sobre el pin
3. El pin se marca como fijado (aparece 📌)

**Método 2: Botón Fijar**
1. Click en el pin para seleccionarlo
2. Click en botón "📌 FIJAR"
3. El pin se marca como fijado

### 2. Tomar Medida entre Pines Fijos

1. Coloca y fija al menos 2 pines en el mapa
2. Click en herramienta "📏 MEDIDA"
3. Click en botón "📍 USAR PINES FIJOS"
4. Click en primer pin fijo (se marca con anillo verde)
5. Click en segundo pin fijo
6. Medida creada automáticamente entre ambos pines

### 3. Tomar Medida Libre (Click en Mapa)

1. Click en herramienta "📏 MEDIDA"
2. **NO** activar "📍 USAR PINES FIJOS"
3. Click en punto inicial en el mapa
4. Click en punto final en el mapa
5. Medida creada

## Ventajas

✅ **Precisión**: Mediciones exactas entre puntos específicos marcados
✅ **Reutilizable**: Los mismos pines pueden usarse para múltiples mediciones
✅ **Flexible**: Combina mediciones libres y mediciones con pines fijos
✅ **Visual**: Identificación clara de pines fijados con iconos y colores
✅ **Retrocompatible**: Pines existentes siguen funcionando normalmente

## Ejemplos de Uso

### Caso 1: Construcción
- Fijar pines en esquinas del terreno
- Tomar medidas precisas entre esquinas
- Crear múltiples mediciones desde los mismos puntos de referencia

### Caso 2: Levantamiento Topográfico
- Fijar pines en puntos de control conocidos
- Medir distancias entre puntos de control
- Garantizar mediciones consistentes y repetibles

### Caso 3: Seguimiento de Avance
- Fijar pines en inicio y fin de sección
- Medir avance en diferentes fechas
- Comparar mediciones a lo largo del tiempo

## Notas Técnicas

- **Compatibilidad**: Funciona con pines nuevos y existentes
- **Migración**: Ejecutar `supabase_pines_fijados_migration.sql` en Supabase
- **Estado por defecto**: Nuevos pines tienen `fijado = false`
- **Persistencia**: El estado fijado se guarda en base de datos
- **Performance**: Sin impacto significativo (un campo booleano adicional)

## Archivos Modificados

```
frontend/src/components/mapas/MapaConAnotaciones.tsx
backend/src/types/database.types.ts
backend/supabase_pines_fijados_migration.sql (NUEVO)
```

## Próximos Pasos

- [ ] Ejecutar migración SQL en Supabase
- [ ] Probar en entorno de desarrollo
- [ ] Probar en mobile (verificar si se necesita agregar la funcionalidad)
- [ ] Documentar en manual de usuario
