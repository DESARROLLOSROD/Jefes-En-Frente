# Jefes en Frente - Aplicación Móvil

Aplicación móvil multiplataforma (Android/iOS) para el sistema de reportes mineros "Jefes en Frente".

## Características

- **Autenticación JWT**: Login seguro con tokens
- **Gestión de Reportes**: Crear y consultar reportes de actividades diarias
- **Multi-proyecto**: Soporte para múltiples proyectos mineros
- **Control de Roles**: Admin, Supervisor y Jefe en Frente
- **Gestión de Vehículos**: Administrar flota y horómetros
- **Zonas de Trabajo**: Gestionar zonas y secciones de trabajo
- **Offline First**: Preparado para capacidad offline (en desarrollo)

## Tecnologías

- **React Native** con **Expo** SDK
- **TypeScript** para tipado estático
- **React Navigation** para navegación
- **Axios** para llamadas a API REST
- **AsyncStorage** para almacenamiento local

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Para Android: Android Studio o Expo Go app
- Para iOS: Xcode (solo en macOS) o Expo Go app

## Instalación

1. Navegar al directorio mobile:
```bash
cd mobile
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar la URL del backend:
   - Editar `src/constants/config.ts`
   - Cambiar `API_URL` según tu configuración:
     - Para emulador Android: `http://10.0.2.2:5000/api`
     - Para dispositivo físico: `http://TU_IP_LOCAL:5000/api`
     - Para producción: `https://tu-backend.com/api`

## Ejecución en Desarrollo

### Iniciar Metro bundler:
```bash
npm start
```

### Ejecutar en Android:
```bash
npm run android
```

### Ejecutar en iOS (solo macOS):
```bash
npm run ios
```

### Ejecutar en Web:
```bash
npm run web
```

### Usar Expo Go (Dispositivo físico):
1. Instalar Expo Go desde Play Store (Android) o App Store (iOS)
2. Ejecutar `npm start`
3. Escanear el código QR con Expo Go

## Estructura del Proyecto

```
mobile/
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── constants/          # Configuración y constantes
│   ├── contexts/           # Context API (AuthContext)
│   ├── navigation/         # Configuración de navegación
│   ├── screens/            # Pantallas de la aplicación
│   │   ├── auth/           # Login
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── projects/       # Gestión de proyectos
│   │   ├── reports/        # Reportes
│   │   ├── users/          # Gestión de usuarios
│   │   ├── vehicles/       # Gestión de vehículos
│   │   └── workzones/      # Zonas de trabajo
│   ├── services/           # API service (axios)
│   ├── types/              # TypeScript types
│   └── utils/              # Utilidades
├── App.tsx                 # Punto de entrada
├── app.json                # Configuración de Expo
└── package.json            # Dependencias
```

## Pantallas Principales

### 1. Login
- Autenticación con email y contraseña
- Almacenamiento seguro del token JWT

### 2. Selección de Proyecto
- Lista de proyectos asignados al usuario
- Selección del proyecto activo

### 3. Dashboard
- Menú principal con opciones según rol
- Información del usuario y proyecto actual

### 4. Crear Reporte
- Formulario para registrar actividades diarias
- Campos: fecha, ubicación, turno, horarios
- Información de personal y observaciones

### 5. Mis Reportes
- Lista de reportes creados
- Búsqueda y filtrado
- Ver detalle de cada reporte

### 6. Gestión (Admin/Supervisor)
- Usuarios
- Vehículos
- Proyectos
- Zonas de trabajo

## Configuración del Backend

La aplicación requiere que el backend esté ejecutándose. Asegúrate de:

1. Backend corriendo en el puerto 5000
2. MongoDB conectada
3. Variables de entorno configuradas (JWT_SECRET, MONGODB_URI)

### Configurar IP para dispositivos físicos:

Si vas a probar en un dispositivo físico:

1. Encontrar tu IP local:
   - Windows: `ipconfig` (buscar IPv4)
   - Mac/Linux: `ifconfig` (buscar inet)

2. Actualizar `src/constants/config.ts`:
```typescript
export const API_URL = 'http://TU_IP_LOCAL:5000/api';
```

3. Asegurarse de que el backend acepte conexiones desde esa IP (configurar CORS)

## Build de Producción

### Android APK:
```bash
eas build -p android --profile preview
```

### Android App Bundle (para Google Play):
```bash
eas build -p android --profile production
```

### iOS (requiere cuenta Apple Developer):
```bash
eas build -p ios --profile production
```

### Configurar EAS Build:
```bash
npm install -g eas-cli
eas login
eas build:configure
```

## Usuarios de Prueba

Para probar la aplicación, puedes usar estos usuarios (si ejecutaste el script de inicialización del backend):

**Admin:**
- Email: admin@jefesfrente.com
- Password: admin123

**Supervisor:**
- Email: supervisor@jefesfrente.com
- Password: supervisor123

**Jefe en Frente:**
- Email: jefe@jefesfrente.com
- Password: jefe123

## Características Pendientes

- [ ] Implementación completa de controles de reporte (acarreo, material, agua, maquinaria)
- [ ] Selección de pines en mapa
- [ ] Generación de PDFs
- [ ] Capacidad offline completa
- [ ] Sincronización de datos
- [ ] Notificaciones push
- [ ] Captura de fotos para reportes
- [ ] Firma digital
- [ ] Modo oscuro

## Solución de Problemas

### Error de conexión al backend:
- Verificar que el backend esté corriendo
- Verificar la URL en `config.ts`
- Para emulador Android, usar `10.0.2.2` en lugar de `localhost`
- Verificar configuración de CORS en el backend

### Error "Unable to resolve module":
```bash
npm install
npx expo start -c
```

### Problemas con navegación:
```bash
npm install react-native-gesture-handler react-native-reanimated
```

### Limpiar caché:
```bash
npx expo start -c
```

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run android`: Ejecuta en emulador/dispositivo Android
- `npm run ios`: Ejecuta en simulador iOS (solo macOS)
- `npm run web`: Ejecuta en navegador web
- `npm test`: Ejecuta tests (cuando se implementen)

## Contribuir

1. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commit de tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear un Pull Request

## Licencia

Copyright © 2025 Jefes en Frente

## Contacto

Para soporte o preguntas, contactar al equipo de desarrollo.

---

**Nota**: Esta es la versión 1.0 de la aplicación móvil. Algunas características están en desarrollo y se irán agregando en futuras versiones.
