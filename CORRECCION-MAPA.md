# Corrección: Mapa no se Guardaba ni se Mostraba

## Problemas Identificados y Corregidos

### ❌ PROBLEMA 1: Backend no aceptaba el campo `mapa`

**Descripción**: Las rutas de crear y actualizar proyectos no incluían el campo `mapa` en el body de la petición.

**Archivos afectados**:
- `backend/src/routes/proyectos.ts`

**Solución aplicada**:
```typescript
// ANTES (línea 23):
const { nombre, ubicacion, descripcion } = req.body;

// DESPUÉS:
const { nombre, ubicacion, descripcion, mapa } = req.body;

// Y al crear/actualizar:
const nuevoProyecto = new Proyecto({
    nombre,
    ubicacion,
    descripcion,
    mapa  // ← AGREGADO
});
```

---

### ❌ PROBLEMA 2: Proyecto en contexto no se actualizaba

**Descripción**: Cuando actualizabas un proyecto en `GestionProyectos`, el proyecto en el contexto de autenticación (`useAuth`) no se actualizaba, por lo que el formulario de reportes seguía viendo la versión antigua sin el mapa.

**Archivos afectados**:
- `frontend/src/types/auth.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/components/projects/GestionProyectos.tsx`

**Solución aplicada**:

1. **Agregada nueva función al contexto**:
```typescript
// frontend/src/types/auth.ts
export interface AuthContextType {
  // ... campos existentes ...
  actualizarProyecto: (proyecto: Proyecto) => void; // ← NUEVO
}
```

2. **Implementada función en AuthContext**:
```typescript
// frontend/src/contexts/AuthContext.tsx
const actualizarProyecto = (proyectoActualizado: Proyecto) => {
  // Si el proyecto actualizado es el proyecto actual, actualizarlo
  if (proyecto && proyecto._id === proyectoActualizado._id) {
    setProyecto(proyectoActualizado);
    localStorage.setItem('proyecto', JSON.stringify(proyectoActualizado));
  }

  // También actualizar en la lista de proyectos del usuario
  if (user) {
    const usuarioActualizado = {
      ...user,
      proyectos: user.proyectos.map(p =>
        p._id === proyectoActualizado._id ? proyectoActualizado : p
      )
    };
    setUser(usuarioActualizado);
    localStorage.setItem('user', JSON.stringify(usuarioActualizado));
  }
};
```

3. **Usada función en GestionProyectos**:
```typescript
// frontend/src/components/projects/GestionProyectos.tsx
const { actualizarProyecto } = useAuth();

// En handleSubmit, al actualizar:
if (response.success && response.data) {
  actualizarProyecto(response.data); // ← AGREGADO
  cargarProyectos();
  cerrarModal();
}
```

---

## Archivos Modificados en esta Corrección

```
backend/
└── src/
    └── routes/
        └── proyectos.ts           ✏️ CORREGIDO

frontend/
└── src/
    ├── types/
    │   └── auth.ts                ✏️ CORREGIDO
    ├── contexts/
    │   └── AuthContext.tsx        ✏️ CORREGIDO
    └── components/
        └── projects/
            └── GestionProyectos.tsx  ✏️ CORREGIDO
```

---

## Flujo Completo Ahora Funcional

### 1. Guardar Mapa en Proyecto

```
Usuario sube imagen
      ↓
GestionProyectos convierte a Base64
      ↓
Envía a API: POST/PUT /api/proyectos
      ↓
Backend guarda en MongoDB (con campo mapa)
      ↓
Response con proyecto actualizado
      ↓
GestionProyectos llama actualizarProyecto()
      ↓
Contexto actualiza proyecto en estado Y localStorage
      ↓
✅ MAPA GUARDADO Y DISPONIBLE
```

### 2. Mostrar Mapa en Reportes

```
Usuario va a crear reporte
      ↓
FormularioReporte usa useAuth() para obtener proyecto
      ↓
Proyecto tiene campo mapa actualizado (desde localStorage)
      ↓
Condición: {proyecto?.mapa?.imagen?.data && ...}
      ↓
✅ MUESTRA MapaPinSelector
```

---

## Cómo Probar la Corrección

### Test 1: Crear Proyecto con Mapa
1. Ir a "Gestión de Proyectos"
2. Click en "+ NUEVO PROYECTO"
3. Llenar nombre, ubicación, descripción
4. Subir imagen de mapa (PNG/JPG, max 5MB)
5. Click en "GUARDAR"
6. ✅ Verificar que el proyecto se creó con el mapa

### Test 2: Actualizar Proyecto Existente con Mapa
1. Ir a "Gestión de Proyectos"
2. Click en "EDITAR" en un proyecto existente
3. Subir imagen de mapa
4. Click en "GUARDAR"
5. ✅ Verificar que el mapa se guardó

### Test 3: Ver Mapa en Reportes (Flujo Completo)
1. Ir a "Gestión de Proyectos"
2. Editar el proyecto ACTUALMENTE SELECCIONADO
3. Subir mapa
4. Guardar
5. Ir a "Crear Reporte"
6. ✅ Debería aparecer la sección "UBICACIÓN EN MAPA DEL PROYECTO"
7. Click en el mapa para colocar pin
8. Guardar reporte
9. Descargar PDF
10. ✅ El PDF debe mostrar el mapa con el pin

---

## Debugging si aún no funciona

### Si el mapa no se guarda:

1. **Verificar que el backend está actualizado**:
```bash
cd backend
npm run build
npm start
```

2. **Verificar en consola del navegador**:
- Abrir DevTools → Network
- Al guardar proyecto, ver la petición POST/PUT
- Verificar que el body incluye el campo `mapa`
- Ver la respuesta del servidor

3. **Verificar en MongoDB**:
```javascript
// Conectar a MongoDB y verificar
db.proyectos.findOne({ nombre: "NOMBRE_DEL_PROYECTO" })
// Debe tener el campo "mapa"
```

### Si el mapa no se muestra en reportes:

1. **Verificar localStorage**:
```javascript
// En consola del navegador:
JSON.parse(localStorage.getItem('proyecto'))
// Debe tener el campo "mapa"
```

2. **Si no tiene el campo mapa en localStorage**:
   - Cerrar sesión
   - Volver a iniciar sesión
   - Seleccionar el proyecto nuevamente
   - Ir a crear reporte

3. **Verificar en React DevTools**:
   - Instalar React DevTools
   - Ver el componente `FormularioReporte`
   - Verificar que `proyecto` tiene el campo `mapa`

---

## Compilación

✅ Backend: Compilado sin errores
✅ Frontend: Tipos correctos
✅ Todas las rutas actualizadas

---

## Resumen de Cambios

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `backend/src/routes/proyectos.ts` | Agregado campo `mapa` en POST y PUT | Backend no guardaba el mapa |
| `frontend/src/types/auth.ts` | Agregada función `actualizarProyecto` | Necesaria para actualizar contexto |
| `frontend/src/contexts/AuthContext.tsx` | Implementada `actualizarProyecto` | Sincronizar proyecto con localStorage |
| `frontend/src/components/projects/GestionProyectos.tsx` | Llamar `actualizarProyecto` al guardar | Actualizar contexto al editar proyecto |

---

✅ **CORRECCIÓN APLICADA - MAPA DEBERÍA FUNCIONAR CORRECTAMENTE AHORA**

## Próximos Pasos

1. Reiniciar el backend: `cd backend && npm start`
2. Reiniciar el frontend: `cd frontend && npm run dev`
3. Cerrar sesión y volver a iniciar sesión
4. Ir a Gestión de Proyectos → Editar el proyecto seleccionado
5. Subir mapa
6. Guardar
7. Ir a Crear Reporte
8. ✅ Debería aparecer el mapa
