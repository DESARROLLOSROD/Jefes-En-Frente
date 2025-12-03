# Debug: Verificar por qué no aparece el mapa

## Estado Actual
✅ API GET `/api/proyectos/:id` responde con éxito (status 200)
❓ Pero el mapa no aparece en el formulario

## Logs Agregados para Debugging

### Backend (Terminal del servidor)
Cuando hagas GET al proyecto, ahora verás:
```
✅ Proyecto encontrado: 693050da8a99348e71be0eb4
✅ Tiene mapa: true/false
✅ Mapa tiene imagen: true/false
✅ Imagen tiene data: true/false
```

### Frontend (Consola del navegador - F12)
Cuando abras el formulario de reportes, verás:
```
🗺️ Verificando si mostrar mapa:
- proyecto: {_id: "...", nombre: "...", ...}
- proyecto?.mapa: {...} o undefined
- proyecto?.mapa?.imagen: {...} o undefined
- proyecto?.mapa?.imagen?.data: "SÍ TIENE" o "NO TIENE"
- Condición cumplida: true o false
```

---

## Pasos para Debuggear

### 1. Reiniciar Backend
```bash
cd backend
npm start
```

Debe mostrar: `Servidor corriendo en puerto 5000`

### 2. Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Abrir la Aplicación
- Ir a http://localhost:5173 (o el puerto que use Vite)
- Iniciar sesión
- Abrir **Crear Reporte**

### 4. Verificar Terminal del Backend
Busca en la terminal del backend algo como:
```
✅ Proyecto encontrado: 693050da8a99348e71be0eb4
✅ Tiene mapa: true
✅ Mapa tiene imagen: true
✅ Imagen tiene data: true
```

**Si dice `false` en cualquiera:**
- El proyecto NO tiene mapa guardado en MongoDB
- Solución: Ir a Gestión de Proyectos → Editar proyecto → Subir mapa

### 5. Verificar Consola del Navegador (F12 → Console)
Busca el bloque que dice:
```
🗺️ Verificando si mostrar mapa:
```

#### Caso A: Si dice "Condición cumplida: true"
El problema es del renderizado del componente MapaPinSelector.
Verificar:
- ¿Hay algún error de TypeScript/React después?
- ¿El componente MapaPinSelector existe en `frontend/src/components/mapas/`?

#### Caso B: Si dice "Condición cumplida: false"
Expandir los objetos en la consola para ver exactamente dónde se rompe la cadena:
```javascript
// Copiar y pegar en consola:
const p = JSON.parse(localStorage.getItem('proyecto'));
console.log('Proyecto completo:', p);
console.log('Tiene mapa:', p.mapa);
console.log('Mapa:', p.mapa);
```

---

## Escenarios Posibles

### Escenario 1: Backend dice "Tiene mapa: false"
**Problema**: El proyecto no tiene mapa en MongoDB.

**Solución**:
1. Ir a **Gestión de Proyectos**
2. Click en **Editar** en el proyecto 5316 SAUCITO
3. En la sección "MAPA DEL PROYECTO", click en **Seleccionar Imagen**
4. Subir un PNG o JPG (máximo 5MB)
5. Debe aparecer una vista previa
6. Click en **Guardar Proyecto**
7. Ir a **Crear Reporte**
8. Ahora SÍ debería aparecer el mapa

### Escenario 2: Backend dice "Tiene mapa: true", Frontend dice "NO TIENE"
**Problema**: El proyecto en localStorage está desactualizado.

**Solución 1 - Forzar recarga**:
```javascript
// En consola del navegador:
localStorage.removeItem('proyecto');
location.reload();
// Volver a iniciar sesión
```

**Solución 2 - Verificar que recargarProyectoActual funcione**:
Busca en la consola:
```
Recargando proyecto con ID: ...
Respuesta de recargar proyecto: ...
```

Si NO aparecen estos logs, el useEffect no se está ejecutando.

### Escenario 3: Backend y Frontend dicen "true", pero no aparece
**Problema**: El componente MapaPinSelector no está renderizando.

**Verificar**:
```bash
# ¿Existe el archivo?
dir frontend\src\components\mapas\MapaPinSelector.tsx
```

Si no existe, hay que crearlo de nuevo.

### Escenario 4: Aparece error en consola
Si ves un error rojo en la consola del navegador, cópialo completo y compártelo.

---

## Prueba Manual Rápida

### Opción A: Verificar en MongoDB directamente
```javascript
// En MongoDB Compass o mongosh:
db.proyectos.findOne(
  { _id: ObjectId("693050da8a99348e71be0eb4") },
  { nombre: 1, mapa: 1 }
)

// Debe mostrar:
{
  "_id": ObjectId("693050da8a99348e71be0eb4"),
  "nombre": "5316 SAUCITO",
  "mapa": {
    "imagen": {
      "data": "iVBORw0KGgoAAAANSUhEUgAA...", // Base64 largo
      "contentType": "image/png"
    },
    "width": 1920,
    "height": 1080
  }
}
```

Si NO tiene campo `mapa`, el mapa no se guardó.

### Opción B: Probar API con curl/Postman
```bash
# Primero obtener token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tu@email.com\",\"password\":\"tupassword\"}"

# Copiar el token de la respuesta y usarlo aquí:
curl -H "Authorization: Bearer TU_TOKEN_AQUI" \
  http://localhost:5000/api/proyectos/693050da8a99348e71be0eb4

# Debe devolver JSON con campo "mapa"
```

---

## Checklist de Verificación

- [ ] Backend está corriendo (puerto 5000)
- [ ] Frontend está corriendo (puerto 5173)
- [ ] Usuario está logueado
- [ ] Proyecto está seleccionado
- [ ] Terminal backend muestra "✅ Tiene mapa: true"
- [ ] Consola navegador muestra "Condición cumplida: true"
- [ ] No hay errores rojos en consola del navegador
- [ ] Archivo MapaPinSelector.tsx existe

---

## Siguiente Paso

**Por favor comparte**:

1. **Lo que aparece en la TERMINAL DEL BACKEND** cuando abres "Crear Reporte":
   ```
   ✅ Proyecto encontrado: ...
   ✅ Tiene mapa: ...
   etc.
   ```

2. **Lo que aparece en la CONSOLA DEL NAVEGADOR** (F12 → Console):
   ```
   🗺️ Verificando si mostrar mapa:
   - proyecto: ...
   - proyecto?.mapa: ...
   etc.
   ```

3. **Screenshot** de la pantalla de "Crear Reporte" (para ver si hay algo visible)

Con esta información sabré exactamente dónde está el problema.
