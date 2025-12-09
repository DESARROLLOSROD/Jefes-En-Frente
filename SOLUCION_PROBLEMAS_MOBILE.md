# Solución de Problemas - App Móvil

## 🔧 Problemas Reportados y Soluciones

### 1. ❌ "No puedo agregar en las secciones de control"

**Problema:** Los botones "+ Agregar" no funcionan en Control de Acarreo, Material, Agua o Maquinaria.

**Solución Implementada:**
- ✅ Se crearon 4 componentes completos con modales funcionales
- ✅ Cada componente tiene botón "+ Agregar" que abre modal
- ✅ Los modales permiten agregar/editar items
- ✅ Incluyen validación de campos requeridos

**Cómo verificar:**
1. Abre la app en modo desarrollo: `cd mobile && npm start`
2. Crea un nuevo reporte
3. Desplázate hasta las secciones de control
4. Toca "+ Agregar" en cualquier sección
5. Deberías ver un modal para llenar datos

**Si aún no funciona:**
- Verifica que los archivos están en: `mobile/src/components/reports/`
- Revisa la consola de React Native para errores
- Ejecuta: `cd mobile && npm install` por si faltan dependencias

---

### 2. ❌ "No se muestra el mapa"

**Problema:** El mapa del proyecto no aparece en el formulario de reportes.

**Causas Posibles:**
1. **El proyecto no tiene mapa configurado**
2. **Formato de imagen incorrecto**
3. **Error al cargar imagen base64**

**Solución Implementada:**
- ✅ Componente `MapPinSelector` que muestra mapas en base64
- ✅ Renderizado condicional: solo muestra si `selectedProject?.mapa` existe
- ✅ Mensaje amigable cuando no hay mapa: "🗺️ Este proyecto no tiene un mapa configurado"

**Cómo verificar:**
1. Asegúrate de que el proyecto tiene un mapa:
   - Ir al frontend web
   - Admin → Proyectos
   - Editar proyecto y subir imagen de mapa
2. En la app móvil, verifica los logs:
   - Deberías ver: `🗺️ Proyecto tiene mapa: true`
   - Si dice `false`, el proyecto no tiene mapa

**Debug en la consola:**
```javascript
// Busca estos logs al abrir el formulario
📡 Cargando datos para proyecto: [Nombre]
✅ Zonas cargadas: X
✅ Vehículos cargados: Y
🗺️ Proyecto tiene mapa: true/false
```

---

### 3. ❌ "No puedo agregar zonas"

**Problema:** No aparecen selectores para elegir Zona y Sección en el formulario.

**Solución Implementada:**
- ✅ Componente `Picker` personalizado con modal
- ✅ Selector de "Zona de Trabajo" agregado
- ✅ Selector de "Sección" (aparece después de elegir zona)
- ✅ Renderizado condicional: solo muestra si hay zonas disponibles

**Cómo verificar:**
1. El proyecto debe tener zonas creadas:
   - Frontend web → Zonas de Trabajo
   - Crear al menos una zona con secciones
2. En la app móvil, después de "Personal" deberías ver:
   - Título: "Ubicación del Trabajo"
   - Selector: "Zona de Trabajo"
   - (Después de seleccionar) Selector: "Sección"

**Si no aparecen:**
- Verifica los logs: `✅ Zonas cargadas: X`
- Si X = 0, el proyecto no tiene zonas creadas
- Crea zonas desde el frontend web primero

---

## 🚀 Pasos para Probar Todo

### 1. Iniciar en Modo Desarrollo

```bash
cd mobile
npm start
```

Escanea el QR con Expo Go o ejecuta en emulador:
```bash
npm run android  # Android
npm run ios      # iOS
```

### 2. Verificar Logs en la Consola

Cuando abras el formulario de reportes, deberías ver:

```
📡 Cargando datos para proyecto: Mi Proyecto
✅ Zonas cargadas: 3
✅ Vehículos cargados: 5
🗺️ Proyecto tiene mapa: true
```

### 3. Probar Cada Funcionalidad

**✅ Agregar Control de Acarreo:**
1. Scroll hasta "🚛 Control de Acarreo"
2. Toca "+ Agregar"
3. Llena: Material (requerido), Viajes (requerido), Capacidad (requerido)
4. Toca "Guardar"
5. Deberías ver una tarjeta con el item agregado

**✅ Seleccionar Zona:**
1. En "Ubicación del Trabajo"
2. Toca "Zona de Trabajo"
3. Elige una zona del modal
4. Automáticamente aparecerá "Sección"

**✅ Colocar Pin en Mapa:**
1. Scroll hasta "📍 Ubicación en el Mapa"
2. Toca en cualquier parte del mapa
3. Deberías ver un pin rojo aparecer
4. Puedes moverlo tocando otra ubicación
5. Usa "Quitar Pin" para eliminarlo

---

## 📱 Archivos Creados/Modificados

### Nuevos Componentes:

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `ControlAcarreoSection.tsx` | `mobile/src/components/reports/` | Control de acarreo |
| `ControlMaterialSection.tsx` | `mobile/src/components/reports/` | Control de material |
| `ControlAguaSection.tsx` | `mobile/src/components/reports/` | Control de agua |
| `ControlMaquinariaSection.tsx` | `mobile/src/components/reports/` | Control de maquinaria |
| `MapPinSelector.tsx` | `mobile/src/components/maps/` | Mapa interactivo |
| `Picker.tsx` | `mobile/src/components/common/` | Selector con modal |

### Archivos Modificados:

| Archivo | Cambios |
|---------|---------|
| `ReportFormScreen.tsx` | ✅ Integración de todos los componentes |
| `ReportDetailScreen.tsx` | ✅ Visualización de mapa |
| `LoginScreen.tsx` | ✅ Mostrar/ocultar password |
| `api.ts` | ✅ Fix de auth con Railway |

---

## 🐛 Errores Comunes

### Error: "Cannot read property 'mapa' of undefined"

**Causa:** El proyecto no está cargado correctamente

**Solución:**
1. Cierra y vuelve a abrir la app
2. Asegúrate de seleccionar un proyecto después del login
3. Verifica que `selectedProject` no sea null

---

### Error: "Network request failed"

**Causa:** No se puede conectar al backend de Railway

**Solución:**
1. Verifica que el backend esté corriendo: `https://jefes-backend-production.up.railway.app/api`
2. Verifica conexión a internet
3. Revisa CORS en el backend (debería estar en modo permisivo)

---

### Zonas no cargan

**Causa:** El endpoint puede estar fallando

**Solución:**
1. Verifica que el proyecto tenga zonas creadas
2. Prueba el endpoint manualmente:
   ```bash
   curl https://jefes-backend-production.up.railway.app/api/projects/[PROJECT_ID]/zones
   ```
3. Revisa los logs del backend en Railway

---

## ✅ Checklist Final

Antes de reportar un problema, verifica:

- [ ] La app está en modo desarrollo (`npm start`)
- [ ] Estás logueado correctamente
- [ ] Has seleccionado un proyecto
- [ ] El proyecto tiene zonas creadas (si quieres usar zonas)
- [ ] El proyecto tiene mapa cargado (si quieres usar mapa)
- [ ] No hay errores en la consola de React Native
- [ ] La conexión al backend funciona

---

## 📞 Cómo Reportar Problemas

Si algo aún no funciona, proporciona:

1. **Logs de la consola** (copia todo el output)
2. **Pasos exactos** para reproducir el problema
3. **Screenshots** de la pantalla con error
4. **Qué esperabas** que sucediera
5. **Qué sucedió** en realidad

---

## 🎯 Próximas Mejoras

Una vez que verifiques que todo funciona:

1. **Crear APK** para distribución
2. **Editar/Eliminar** reportes existentes
3. **PDFs profesionales** con todas las secciones
4. **Captura de fotos** en reportes
5. **GPS automático** para ubicación

---

**Última actualización:** Diciembre 9, 2025
**Versión de la app:** 1.0.0
