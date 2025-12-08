# Guía Rápida - Jefes en Frente Mobile

## Inicio Rápido (5 minutos)

### 1. Verificar el Backend
Asegúrate de que el backend esté corriendo:
```bash
cd ../backend
npm run dev
```

El backend debería estar corriendo en `http://localhost:5000`

### 2. Configurar la URL de la API

**Para Emulador Android:**
- Ya está configurado en `src/constants/config.ts` como `http://10.0.2.2:5000/api`
- No necesitas cambiar nada

**Para Dispositivo Físico:**
1. Encontrar tu IP local:
   - Windows: Abrir CMD y ejecutar `ipconfig` (buscar IPv4 Address)
   - Ejemplo: `192.168.1.100`

2. Editar `mobile/src/constants/config.ts`:
```typescript
export const API_URL = 'http://192.168.1.100:5000/api';  // Tu IP aquí
```

3. En el backend, verificar CORS en `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: '*',  // O especificar tu IP
}));
```

### 3. Instalar Dependencias
```bash
cd mobile
npm install
```

### 4. Iniciar la Aplicación

**Opción A: Expo Go (Más Fácil - Dispositivo Físico)**
1. Instalar "Expo Go" en tu celular desde Play Store o App Store
2. Ejecutar:
```bash
npm start
```
3. Escanear el código QR con Expo Go
4. ¡Listo!

**Opción B: Emulador Android**
1. Asegúrate de tener Android Studio instalado
2. Ejecutar:
```bash
npm run android
```

**Opción C: Simulador iOS (Solo macOS)**
```bash
npm run ios
```

### 5. Probar la Aplicación

Usa estas credenciales de prueba:

**Jefe en Frente (Operador):**
- Email: `jefe@jefesfrente.com`
- Password: `jefe123`

**Supervisor:**
- Email: `supervisor@jefesfrente.com`
- Password: `supervisor123`

**Admin:**
- Email: `admin@jefesfrente.com`
- Password: `admin123`

## Flujo de Uso

1. **Login** → Ingresar credenciales
2. **Seleccionar Proyecto** → Elegir proyecto activo
3. **Dashboard** → Ver menú principal
4. **Crear Reporte** → Registrar actividades diarias
5. **Mis Reportes** → Consultar reportes creados

## Soluciones Rápidas

### No se conecta al backend:
```bash
# 1. Verificar que el backend esté corriendo
cd ../backend
npm run dev

# 2. Para emulador Android, usar esta URL en config.ts:
http://10.0.2.2:5000/api

# 3. Para dispositivo físico, usar tu IP local:
http://TU_IP_LOCAL:5000/api
```

### Error al iniciar:
```bash
# Limpiar caché y reinstalar
npm install
npm run start:clear
```

### Error de módulos:
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

## Arquitectura Simplificada

```
Login → Selección Proyecto → Dashboard
                                  ├── Crear Reporte ✓
                                  ├── Mis Reportes ✓
                                  ├── Usuarios (Admin/Supervisor)
                                  ├── Vehículos (Admin/Supervisor)
                                  ├── Proyectos (Admin)
                                  └── Zonas de Trabajo (Admin/Supervisor)
```

## Funcionalidades Implementadas

✅ Login con JWT
✅ Selección de proyectos
✅ Dashboard por roles
✅ Crear reportes básicos
✅ Lista de reportes
✅ Ver detalle de reportes
✅ Navegación completa
✅ Almacenamiento local (token)

## Próximas Mejoras

🔄 Controles completos (acarreo, material, agua, maquinaria)
🔄 Selección de pines en mapa
🔄 Generación de PDFs
🔄 Modo offline
🔄 Gestión completa de usuarios/vehículos
🔄 Captura de fotos

## Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm start

# Iniciar limpiando caché
npm run start:clear

# Ejecutar en Android
npm run android

# Ejecutar en iOS (solo Mac)
npm run ios

# Ver logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## Tips de Desarrollo

1. **Hot Reload**: Los cambios se actualizan automáticamente
2. **Shake Device**: Menú de desarrollo en dispositivo físico
3. **Ctrl/Cmd + M**: Menú de desarrollo en emulador
4. **R**: Recargar aplicación
5. **D**: Toggle performance monitor

## Estructura de Carpetas Importantes

```
mobile/
├── src/
│   ├── screens/          # Pantallas de la app
│   │   ├── auth/         # Login
│   │   ├── dashboard/    # Dashboard
│   │   └── reports/      # Reportes
│   ├── services/         # API calls
│   │   └── api.ts        # Servicio principal de API
│   ├── contexts/         # Context API
│   │   └── AuthContext.tsx  # Autenticación
│   ├── navigation/       # Navegación
│   └── constants/        # Configuración
│       └── config.ts     # ⚠️ Aquí cambiar API_URL
└── App.tsx               # Entry point
```

## Contacto y Soporte

Para dudas o problemas:
1. Verificar README.md completo
2. Revisar logs de Expo
3. Verificar consola del backend
4. Contactar al equipo de desarrollo

---

¡Feliz desarrollo! 🚀
