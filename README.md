# Jefes-En-Frente

## Descripción

Plataforma web y móvil para la gestión y reporte de actividades en proyectos de minería y construcción. Optimiza el control de recursos (agua, material, acarreo) y facilita la toma de decisiones mediante reportes detallados y generación automática de documentación en PDF.

## Funcionalidades Principales

### Gestión Operativa
- Reportes diarios de control de agua, material y acarreo
- Administración de múltiples proyectos con configuraciones específicas
- Registro y seguimiento de vehículos y maquinaria

### Sistema de Roles
- **Administrador**: Acceso completo al sistema, gestión de usuarios, proyectos y vehículos
- **Operador (Jefe en Frente)**: Creación de reportes, visualización de historial y descarga de PDFs

### Documentación y Reportes
- Generación automática de PDFs con diseño corporativo
- Reportes consolidados por proyecto
- Exportación de datos y documentación formal

### Interfaz de Usuario
- Diseño responsivo con modo oscuro
- Notificaciones y validaciones en tiempo real
- Experiencia optimizada para web y móvil

## Stack Tecnológico

### Frontend Web
- React + TypeScript + Vite
- TailwindCSS para diseño responsivo
- jsPDF y jspdf-autotable para generación de PDFs
- Axios para comunicación HTTP

### Aplicación Móvil
- React Native + Expo
- TypeScript
- React Navigation
- Soporte para Android e iOS
- AsyncStorage para persistencia local

### Backend
- Node.js + Express
- TypeScript
- MongoDB con Mongoose ODM
- JWT para autenticación
- bcryptjs para encriptación

## Requisitos Previos

- Node.js v18 o superior
- MongoDB (local o MongoDB Atlas)

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Jefes-En-Frente
```

### 2. Configurar el Backend

Navega al directorio del backend e instala las dependencias:

```bash
cd backend
npm install
```

Crea un archivo `.env` en la raíz de `backend` con las siguientes variables (ejemplo):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jefes-en-frente
JWT_SECRET=tu_secreto_super_seguro
```

Inicializa la base de datos con usuarios y datos por defecto:

```bash
npm run init
# Opcional: Cargar datos de prueba
npm run seed
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

### 3. Configurar el Frontend

Navega al directorio del frontend e instala las dependencias:

```bash
cd ../frontend
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Estructura del Proyecto

```
Jefes-En-Frente/
├── backend/                # API RESTful con Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Lógica de los endpoints
│   │   ├── middleware/     # Auth, validaciones, manejo de errores
│   │   ├── models/         # Esquemas de Mongoose (User, Report, etc.)
│   │   ├── routes/         # Definición de rutas (auth, reportes, etc.)
│   │   ├── scripts/        # Scripts de inicialización y mantenimiento
│   │   ├── types/          # Definiciones de tipos globales
│   │   └── server.ts       # Punto de entrada del servidor
│   └── ...
│
├── frontend/               # SPA con React/Vite
│   ├── src/
│   │   ├── components/     # Componentes UI (Forms, Tables, Layouts)
│   │   ├── contexts/       # Estado global (AuthContext)
│   │   ├── services/       # Capa de servicio API (axios)
│   │   ├── utils/          # Generadores de PDF, formateadores
│   │   ├── pages/          # Vistas principales (Dashboard, Login)
│   │   └── App.tsx         # Configuración de rutas
│   └── ...
│
└── mobile/                 # Aplicación Móvil (Android/iOS)
    ├── src/
    │   ├── screens/        # Pantallas de la aplicación
    │   ├── navigation/     # Configuración de navegación
    │   ├── contexts/       # Estado global (AuthContext)
    │   ├── services/       # API service (axios)
    │   ├── types/          # Tipos TypeScript
    │   └── constants/      # Configuración
    ├── App.tsx             # Punto de entrada
    ├── README.md           # Documentación móvil
    └── GUIA_RAPIDA.md      # Guía de inicio rápido
```

## API Endpoints

Principales endpoints disponibles:

- `/api/auth` - Login, registro y verificación de token
- `/api/reportes` - CRUD de reportes diarios
- `/api/proyectos` - Gestión de proyectos mineros
- `/api/vehiculos` - Gestión de flota
- `/api/usuarios` - Administración de usuarios

## Scripts Disponibles

### Backend
- `npm run dev` - Inicia el servidor en modo desarrollo con recarga automática
- `npm run build` - Compila el código TypeScript a JavaScript
- `npm run start` - Inicia el servidor compilado (producción)
- `npm run init` - Crea el usuario administrador inicial

### Frontend Web
- `npm run dev` - Inicia el servidor de desarrollo de Vite
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa local de la build de producción

### Aplicación Móvil
- `npm start` - Inicia el servidor de desarrollo de Expo
- `npm run android` - Ejecuta la app en emulador/dispositivo Android
- `npm run ios` - Ejecuta la app en simulador iOS (solo macOS)
- `npm run start:clear` - Inicia limpiando caché

Ver documentación completa: [mobile/README.md](mobile/README.md) | [mobile/GUIA_RAPIDA.md](mobile/GUIA_RAPIDA.md)

---

## Aplicación Móvil

La aplicación móvil multiplataforma (Android/iOS) está completamente funcional e integrada con el backend.

### Inicio Rápido

```bash
cd mobile
npm install
npm start
```

Luego usar Expo Go en tu celular o ejecutar en emulador:
- **Android**: `npm run android`
- **iOS**: `npm run ios` (solo macOS)

### Documentación
- [README Completo](mobile/README.md)
- [Guía Rápida](mobile/GUIA_RAPIDA.md)
- [Configuración Backend](CONFIGURACION_MOBILE.md)
- [Resumen de la App](mobile/RESUMEN_APP.md)
- [Mejoras Implementadas](mobile/MEJORAS_IMPLEMENTADAS.md)

---

## Deploy en Producción

El proyecto está configurado para ser desplegado en Vercel o Railway.

### Opción 1: Deploy en Railway (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy Backend
cd backend
railway init
railway up
railway domain create

# Deploy Frontend
cd frontend
railway link
railway service create
railway up
railway domain create
```

**Documentación Railway:**
- [Guía Completa de Railway](DEPLOY_RAILWAY.md) - Instrucciones paso a paso
- [Comandos Rápidos Railway](DEPLOY_RAILWAY_COMANDOS.md) - Referencia rápida
- [Configuración Final](DEPLOY_RAILWAY_FINALIZADO.md) - Variables de entorno y verificación

### Opción 2: Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy Backend
cd backend
vercel --prod

# Deploy Frontend
cd frontend
vercel --prod
```

**Documentación Vercel:**
- [Guía Completa de Vercel](DEPLOY_VERCEL.md) - Instrucciones paso a paso
- [Comandos Rápidos Vercel](DEPLOY_COMANDOS_RAPIDOS.md) - Referencia rápida

### Configuración Necesaria
- MongoDB Atlas (base de datos en la nube)
- Variables de entorno en la plataforma elegida
- CORS configurado para producción

---

**Nota**: Este proyecto es propiedad privada y está diseñado para uso interno.
