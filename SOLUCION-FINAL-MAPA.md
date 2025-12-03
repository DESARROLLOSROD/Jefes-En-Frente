# Solución Final: Mapa se Guarda pero no se Muestra

## Problema
El mapa se guarda correctamente en MongoDB, pero NO aparece en el formulario de reportes.

## Causa Raíz
El proyecto en el contexto (`useAuth`) se carga desde localStorage al iniciar sesión, y NO se actualiza automáticamente cuando editas el proyecto. Aunque el backend guarda el mapa correctamente, el frontend sigue usando la versión antigua sin mapa.

---

## ✅ Solución Implementada

### 1. Agregada Ruta GET por ID en Backend
Para poder recargar un proyecto específico desde el servidor.

**Archivo**: `backend/src/routes/proyectos.ts`

```typescript
// Obtener proyecto por ID
proyectosRouter.get('/:id', async (req, res) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(proyecto);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyecto', error });
    }
});
```

---

### 2. Agregado Servicio para Obtener Proyecto por ID

**Archivo**: `frontend/src/services/api.ts`

```typescript
async obtenerProyectoPorId(id: string): Promise<ApiResponse<Proyecto>> {
  try {
    const response = await api.get<Proyecto>(`/proyectos/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener proyecto',
    };
  }
}
```

---

### 3. Agregada Función para Recargar Proyecto Actual

**Archivos modificados**:
- `frontend/src/types/auth.ts` - Agregada firma de función
- `frontend/src/contexts/AuthContext.tsx` - Implementada función

```typescript
const recargarProyectoActual = async () => {
  if (!proyecto || !proyecto._id) return;

  try {
    const response = await proyectoService.obtenerProyectoPorId(proyecto._id);
    if (response.success && response.data) {
      setProyecto(response.data);
      localStorage.setItem('proyecto', JSON.stringify(response.data));

      // También actualizar en la lista de proyectos del usuario
      if (user) {
        const usuarioActualizado = {
          ...user,
          proyectos: user.proyectos.map(p =>
            p._id === response.data._id ? response.data : p
          )
        };
        setUser(usuarioActualizado);
        localStorage.setItem('user', JSON.stringify(usuarioActualizado));
      }
    }
  } catch (error) {
    console.error('Error al recargar proyecto:', error);
  }
};
```

---

### 4. FormularioReporte Recarga Proyecto al Montarse

**Archivo**: `frontend/src/components/reports/FormularioReporte.tsx`

```typescript
const { proyecto, user, recargarProyectoActual } = useAuth();

// Recargar proyecto al montar el componente para asegurar que tiene el mapa
useEffect(() => {
  recargarProyectoActual();
}, []);
```

**Resultado**: Cada vez que abres el formulario de reportes, automáticamente recarga el proyecto desde el servidor con todos sus datos actualizados, incluyendo el mapa.

---

## Archivos Modificados en esta Solución Final

```
backend/
└── src/
    └── routes/
        └── proyectos.ts           ✏️ Agregada ruta GET /:id

frontend/
└── src/
    ├── services/
    │   └── api.ts                 ✏️ Agregado obtenerProyectoPorId
    ├── types/
    │   └── auth.ts                ✏️ Agregada función recargarProyectoActual
    ├── contexts/
    │   └── AuthContext.tsx        ✏️ Implementada recargarProyectoActual
    └── components/
        └── reports/
            └── FormularioReporte.tsx  ✏️ Llama a recargarProyectoActual
```

---

## Flujo Completo Ahora

```
1. Usuario edita proyecto y sube mapa
   ↓
2. Backend guarda en MongoDB ✅
   ↓
3. GestionProyectos actualiza contexto con actualizarProyecto() ✅
   ↓
4. Usuario va a "Crear Reporte"
   ↓
5. FormularioReporte se monta
   ↓
6. useEffect llama a recargarProyectoActual() ← NUEVO
   ↓
7. Se hace GET /api/proyectos/:id
   ↓
8. Backend devuelve proyecto CON mapa actualizado
   ↓
9. Contexto actualiza proyecto en estado + localStorage
   ↓
10. FormularioReporte renderiza con proyecto actualizado
    ↓
11. Condición: {proyecto?.mapa?.imagen?.data && ...} → TRUE
    ↓
12. ✅ SE MUESTRA MapaPinSelector
```

---

## Cómo Probar Ahora

### Paso 1: Reiniciar Backend
```bash
cd backend
npm start
```

### Paso 2: Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### Paso 3: Probar el Flujo
1. Ir a "Gestión de Proyectos"
2. Editar cualquier proyecto
3. Subir imagen de mapa (PNG/JPG)
4. Guardar
5. Ir a "Crear Reporte"
6. **✅ AHORA SÍ DEBERÍA APARECER EL MAPA AUTOMÁTICAMENTE**
7. Colocar pin en el mapa
8. Guardar reporte
9. Descargar PDF
10. **✅ PDF debe mostrar mapa con pin**

---

## Por Qué Funciona Ahora

### Antes:
- Proyecto se guardaba en MongoDB ✅
- Proyecto en localStorage NO se actualizaba ❌
- FormularioReporte usaba versión vieja sin mapa ❌

### Ahora:
- Proyecto se guarda en MongoDB ✅
- GestionProyectos actualiza localStorage ✅
- **FormularioReporte recarga proyecto desde servidor** ✅ ← CLAVE
- FormularioReporte siempre tiene la versión más reciente ✅

---

## Debugging

### Si aún no aparece el mapa:

**1. Verificar en consola del navegador (F12)**:
```javascript
// Debe hacer GET /api/proyectos/:id al abrir el formulario
```

**2. Verificar que el proyecto tiene mapa en MongoDB**:
```javascript
// En MongoDB Compass o shell:
db.proyectos.findOne({ _id: ObjectId("TU_ID_PROYECTO") })
// Debe tener campo "mapa" con "imagen", "width", "height"
```

**3. Verificar en React DevTools**:
- Instalar React DevTools
- Ir a componente `FormularioReporte`
- Ver props → `proyecto` debe tener campo `mapa`

**4. Verificar que backend devuelve el mapa**:
```bash
# En terminal, hacer petición directa:
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:5000/api/proyectos/TU_ID_PROYECTO
# Debe incluir el campo "mapa"
```

---

## Resumen de Todos los Cambios (Todas las Correcciones)

| # | Problema | Solución | Archivos |
|---|----------|----------|----------|
| 1 | Backend no guardaba `mapa` | Agregado campo `mapa` en POST/PUT | `backend/src/routes/proyectos.ts` |
| 2 | Contexto no se actualizaba | Función `actualizarProyecto()` | `frontend/src/contexts/AuthContext.tsx` |
| 3 | Proyecto no se recargaba | Función `recargarProyectoActual()` | `frontend/src/contexts/AuthContext.tsx` |
| 4 | FormularioReporte usaba versión vieja | useEffect recarga proyecto | `frontend/src/components/reports/FormularioReporte.tsx` |
| 5 | Faltaba ruta GET por ID | GET `/api/proyectos/:id` | `backend/src/routes/proyectos.ts` |

---

## ✅ SOLUCIÓN COMPLETA IMPLEMENTADA

**Backend**: ✅ Compilado sin errores
**Frontend**: ✅ Tipos correctos
**Flujo**: ✅ Proyecto se recarga automáticamente

---

## Próximos Pasos

1. **Reiniciar backend y frontend**
2. **Ir a Gestión de Proyectos**
3. **Editar proyecto y subir mapa**
4. **Ir a Crear Reporte**
5. **✅ El mapa DEBE aparecer automáticamente**

Si después de esto no aparece, por favor comparte:
- Captura de consola del navegador (F12 → Console)
- Captura de Network tab mostrando la petición GET /api/proyectos/:id
- Screenshot del proyecto en MongoDB mostrando el campo `mapa`

---

**¡AHORA SÍ DEBERÍA FUNCIONAR!** 🎉
