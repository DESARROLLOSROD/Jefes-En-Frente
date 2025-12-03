# Debug Error 404: GET /api/proyectos/:id

## Error Actual
```
GET http://localhost:5000/api/proyectos/693050da8a99348e71be0eb4 404 (Not Found)
```

## Cambios Aplicados para Debugging

### 1. Backend: Validación de ID y Logs
**Archivo**: `backend/src/routes/proyectos.ts`

```typescript
proyectosRouter.get('/:id', async (req, res) => {
    try {
        // Validar que el ID sea válido
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }

        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(proyecto);
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).json({ message: 'Error al obtener proyecto', error });
    }
});
```

### 2. Frontend: Console Logs en AuthContext
**Archivo**: `frontend/src/contexts/AuthContext.tsx`

Ahora imprime en consola:
- ID del proyecto que intenta recargar
- Respuesta del servidor
- Si el proyecto tiene mapa o no

---

## Pasos para Debuggear

### 1. Reiniciar Backend
```bash
cd backend
npm start
```

**Observa en la terminal del backend** si aparece algún error cuando se hace la petición.

### 2. Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Abrir Consola del Navegador
- Presiona F12
- Ve a la pestaña "Console"

### 4. Ir a "Crear Reporte"
Al abrir el formulario de reportes, deberías ver en consola:

```
Recargando proyecto con ID: 693050da8a99348e71be0eb4
Respuesta de recargar proyecto: { success: ..., data: ... }
Proyecto recargado exitosamente. Tiene mapa: true/false
```

### 5. Ver Network Tab
- En DevTools, ve a "Network"
- Busca la petición: `proyectos/693050da8a99348e71be0eb4`
- Click derecho → "Copy as cURL"
- Pégalo aquí para analizarlo

---

## Posibles Causas del 404

### Causa 1: El proyecto no existe en MongoDB
**Verificar**:
```javascript
// En MongoDB Compass o shell:
db.proyectos.findOne({ _id: ObjectId("693050da8a99348e71be0eb4") })
```

**Si no existe**: El ID en localStorage es incorrecto.
**Solución**: Cerrar sesión y volver a iniciar sesión.

### Causa 2: El backend no está corriendo
**Verificar**:
```bash
curl http://localhost:5000/api/proyectos
```

**Si falla**: Reiniciar el backend.

### Causa 3: Middleware de autenticación bloquea
**Verificar** en backend si se aplica `verificarToken` a la ruta GET.

**Solución**: Asegurar que el token esté en el header.

### Causa 4: Orden de rutas incorrecto
Las rutas en Express se evalúan en orden. La ruta `/:id` debe estar ANTES que cualquier ruta más específica.

**Orden correcto** (ya aplicado):
```typescript
proyectosRouter.get('/')           // 1. Todos los proyectos
proyectosRouter.get('/:id')        // 2. Proyecto por ID
proyectosRouter.post('/')          // 3. Crear
proyectosRouter.put('/:id')        // 4. Actualizar
proyectosRouter.delete('/:id')     // 5. Eliminar
```

---

## Verificación Manual de la Ruta

### Test 1: Verificar que la ruta existe
**En terminal backend**:
```bash
cd backend
npm start
```

Debería mostrar que el servidor está corriendo en puerto 5000.

### Test 2: Probar con curl (sin autenticación primero)
```bash
# Obtener todos los proyectos
curl http://localhost:5000/api/proyectos

# Si falla, el servidor no está corriendo
```

### Test 3: Probar con curl CON autenticación
```bash
# Primero, obtener un token (reemplaza con tus credenciales)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

# Luego, probar la ruta de proyecto por ID
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/proyectos/693050da8a99348e71be0eb4
```

**Si devuelve 404**: El proyecto no existe en la base de datos.
**Si devuelve 401**: Problema de autenticación.
**Si devuelve 200**: La ruta funciona, el problema está en el frontend.

---

## Solución Rápida: Verificar en MongoDB

### Opción 1: MongoDB Compass
1. Abrir MongoDB Compass
2. Conectar a tu base de datos
3. Ir a colección `proyectos`
4. Buscar el proyecto con ID `693050da8a99348e71be0eb4`
5. Verificar que exista y tenga el campo `mapa`

### Opción 2: MongoDB Shell
```javascript
// Conectar a MongoDB
mongosh

// Usar la base de datos
use jefes-en-frente

// Buscar el proyecto
db.proyectos.findOne({ _id: ObjectId("693050da8a99348e71be0eb4") })

// Si existe, verificar que tenga mapa
db.proyectos.findOne(
  { _id: ObjectId("693050da8a99348e71be0eb4") },
  { mapa: 1 }
)
```

---

## Si el Proyecto NO Existe en MongoDB

El ID en localStorage es incorrecto o desactualizado.

### Solución 1: Cerrar Sesión y Volver a Iniciar
1. Click en "SALIR" en la aplicación
2. Volver a iniciar sesión
3. Seleccionar el proyecto
4. Ir a Gestión de Proyectos
5. Editar el proyecto y subir mapa
6. Ir a Crear Reporte
7. Ahora debería funcionar

### Solución 2: Limpiar localStorage Manualmente
```javascript
// En consola del navegador:
localStorage.clear()
// Recargar página
location.reload()
```

---

## Si el Proyecto SÍ Existe pero Sigue el 404

### Verificar rutas del backend

**Archivo**: `backend/src/app.ts` o `backend/src/index.ts`

Debe tener algo como:
```typescript
import { proyectosRouter } from './routes/proyectos.js';

app.use('/api/proyectos', proyectosRouter);
```

**Verificar** que la ruta esté correctamente montada.

---

## Logs Esperados en Consola del Navegador

### Cuando funciona correctamente:
```
Recargando proyecto con ID: 693050da8a99348e71be0eb4
Respuesta de recargar proyecto: {
  success: true,
  data: {
    _id: "693050da8a99348e71be0eb4",
    nombre: "5316 SAUCITO",
    ubicacion: "SAUCITO DEL POLEO, ZACATECAS",
    mapa: {
      imagen: { data: "...", contentType: "image/png" },
      width: 1920,
      height: 1080
    },
    ...
  }
}
Proyecto recargado exitosamente. Tiene mapa: true
```

### Si hay error:
```
Recargando proyecto con ID: 693050da8a99348e71be0eb4
Error al recargar proyecto: Error al obtener proyecto
```

---

## Próximo Paso

**Por favor comparte**:
1. Lo que aparece en la **consola del navegador** (F12 → Console)
2. Lo que aparece en la **terminal del backend** cuando haces la petición
3. El resultado de ejecutar en MongoDB:
   ```javascript
   db.proyectos.findOne({ _id: ObjectId("693050da8a99348e71be0eb4") })
   ```

Con esta información podré identificar exactamente dónde está el problema.
