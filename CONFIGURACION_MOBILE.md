# Configuración del Backend para App Móvil

## Resumen

La aplicación móvil ya está completamente desarrollada y lista para usarse. Este documento explica cómo configurar el backend para que funcione correctamente con la app móvil.

## Ubicación de la App Móvil

```
Jefes-En-Frente/
├── backend/           # Backend Node.js/Express
├── frontend/          # Frontend React Web
└── mobile/            # ✨ App Móvil (NUEVA)
    ├── src/
    │   ├── screens/   # Pantallas
    │   ├── services/  # API
    │   └── ...
    ├── App.tsx
    ├── package.json
    └── README.md
```

## Paso 1: Configurar CORS en el Backend

La app móvil necesita que el backend acepte peticiones desde cualquier origen o desde IPs locales específicas.

### Opción A: Permitir todos los orígenes (Desarrollo)

Editar `backend/src/server.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: '*',  // Permitir todos los orígenes
  credentials: true
}));
```

### Opción B: Permitir IPs específicas (Recomendado)

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',           // Frontend web
    'http://192.168.1.100:19000',      // Tu IP local con Expo
    'exp://192.168.1.100:8081',        // Expo Go
  ],
  credentials: true
}));
```

## Paso 2: Verificar Variables de Entorno

Asegúrate de que el backend tenga estas variables en `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jefes-en-frente
JWT_SECRET=tu_secreto_super_seguro_aqui
NODE_ENV=development
```

## Paso 3: Inicializar Datos de Prueba

Si aún no lo has hecho, crea los usuarios de prueba:

```bash
cd backend
npm run init
```

Esto creará:
- Admin: admin@jefesfrente.com / admin123
- Supervisor: supervisor@jefesfrente.com / supervisor123
- Jefe: jefe@jefesfrente.com / jefe123

## Paso 4: Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 5000
✅ MongoDB conectado exitosamente
```

## Paso 5: Configurar la App Móvil

### Para Emulador Android (Ya configurado):
No necesitas cambiar nada. La URL ya está configurada como `http://10.0.2.2:5000/api`

### Para Dispositivo Físico:

1. **Encontrar tu IP local:**

**Windows:**
```bash
ipconfig
```
Buscar "Dirección IPv4" (ej: 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```
Buscar "inet" (ej: 192.168.1.100)

2. **Actualizar la configuración:**

Editar `mobile/src/constants/config.ts`:
```typescript
export const API_URL = 'http://192.168.1.100:5000/api';  // Tu IP aquí
```

3. **Asegurarse de que ambos dispositivos estén en la misma red WiFi**

## Paso 6: Iniciar la App Móvil

```bash
cd mobile
npm install      # Primera vez solamente
npm start
```

Luego:
- **Expo Go**: Escanear QR con la app
- **Emulador**: Presionar 'a' para Android o 'i' para iOS

## Verificación de Conexión

### Test 1: Verificar Backend
Abrir en navegador: `http://localhost:5000/api/auth/proyectos`

Deberías ver un error 401 (esperado, necesitas autenticación)

### Test 2: Verificar desde dispositivo móvil
En la app, intentar login con:
- Email: jefe@jefesfrente.com
- Password: jefe123

Si funciona, ¡todo está correcto! 🎉

## Problemas Comunes

### Error: "Network request failed"

**Causa**: La app no puede conectarse al backend

**Soluciones**:
1. Verificar que el backend esté corriendo (`npm run dev`)
2. Verificar la IP en `config.ts`
3. Verificar que estén en la misma red WiFi
4. Para emulador Android, usar `10.0.2.2` en lugar de `localhost`

### Error: "CORS blocked"

**Causa**: Backend no acepta peticiones desde la app

**Solución**:
1. Actualizar CORS en `backend/src/server.ts` (ver Paso 1)
2. Reiniciar el backend

### Error: "Invalid credentials"

**Causa**: Usuario no existe o contraseña incorrecta

**Solución**:
1. Ejecutar `npm run init` en backend
2. Verificar que MongoDB esté corriendo
3. Usar las credenciales exactas del Paso 3

### Error: "Cannot find module"

**Causa**: Dependencias no instaladas

**Solución**:
```bash
cd mobile
rm -rf node_modules
npm install
npm start
```

## Arquitectura de Comunicación

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   App Móvil     │         │     Backend     │         │    MongoDB      │
│  (React Native) │◄────────┤  (Express API)  │◄────────┤   (Database)    │
│                 │  HTTP   │                 │         │                 │
│  Puerto: Expo   │  REST   │  Puerto: 5000   │         │  Puerto: 27017  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │
        └─── JWT Token en AsyncStorage
```

## API Endpoints Utilizados

La app móvil utiliza los siguientes endpoints:

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/proyectos` - Proyectos disponibles

### Reportes
- `GET /api/reportes` - Lista de reportes
- `GET /api/reportes/:id` - Detalle de reporte
- `POST /api/reportes` - Crear reporte
- `PUT /api/reportes/:id` - Actualizar reporte
- `DELETE /api/reportes/:id` - Eliminar reporte

### Proyectos
- `GET /api/proyectos` - Lista de proyectos
- `GET /api/proyectos/:id` - Detalle con mapa

### Usuarios (Admin/Supervisor)
- `GET /api/usuarios` - Lista de usuarios
- `POST /api/usuarios` - Crear usuario

### Vehículos (Admin/Supervisor)
- `GET /api/vehiculos` - Lista de vehículos
- `GET /api/vehiculos/proyecto/:id` - Por proyecto

### Zonas de Trabajo
- `GET /api/projects/:id/zones` - Zonas por proyecto
- `POST /api/zones` - Crear zona

## Seguridad

### Producción
Para producción, actualizar:

1. **Backend CORS**:
```typescript
app.use(cors({
  origin: 'https://tu-dominio-app.com',
  credentials: true
}));
```

2. **App Móvil URL**:
```typescript
export const API_URL = 'https://api.tu-dominio.com/api';
```

3. **Variables de Entorno**:
```env
NODE_ENV=production
JWT_SECRET=un_secreto_muy_seguro_generado_aleatoriamente
```

## Siguientes Pasos

1. ✅ Backend configurado
2. ✅ App móvil instalada
3. ✅ Conexión verificada
4. ✅ Login funcional

Ahora puedes:
- Crear reportes desde el móvil
- Ver lista de reportes
- Gestionar usuarios (Admin/Supervisor)
- Gestionar vehículos (Admin/Supervisor)

## Desarrollo Futuro

Características planeadas:
- Captura de fotos en reportes
- Generación de PDFs en dispositivo
- Modo offline completo
- Sincronización en background
- Notificaciones push
- Firma digital

## Soporte

Para más información, consultar:
- [mobile/README.md](mobile/README.md) - Documentación completa de la app
- [mobile/GUIA_RAPIDA.md](mobile/GUIA_RAPIDA.md) - Guía de inicio rápido
- [README.md](README.md) - Documentación general del proyecto

---

**Última actualización**: 2025
**Versión de la App**: 1.0.0
