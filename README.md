# Jefes-En-Frente

## 📋 Descripción del Proyecto

**Jefes-En-Frente** es una plataforma web integral diseñada para la gestión y reporte de actividades en proyectos de minería y construcción. Su objetivo principal es optimizar el control de recursos (agua, material, acarreo) y facilitar la toma de decisiones mediante reportes detallados y accesibles.

La aplicación permite a los operadores registrar actividades diarias y a los administradores gestionar el sistema completo, asegurando la integridad de los datos y proporcionando herramientas para la generación de documentación formal en PDF.

## ✨ Funcionalidades Clave

### 🛠️ Gestión Operativa
- **Reportes Diarios**: Creación y edición de reportes de control de agua, material y acarreo.
- **Gestión de Proyectos**: Administración de múltiples proyectos con sus respectivas configuraciones.
- **Control de Flota**: Registro y seguimiento de vehículos y maquinaria.

### 👥 Roles y Permisos
- **Administrador**: Acceso total al sistema (Crear/Editar/Eliminar reportes, gestionar usuarios, proyectos y vehículos).
- **Operador (Jefe en Frente)**: Permisos enfocados en la operación diaria (Crear reportes, visualizar historial, descargar PDFs).

### 📄 Documentación y Exportación
- **Generación de PDFs**: Creación automática de reportes formales con diseño corporativo.
- **Reportes Consolidados**: Capacidad de generar reportes generales que agrupan actividades por proyecto.

### 💻 Experiencia de Usuario
- **Interfaz Moderna**: Diseño responsivo y amigable con modo oscuro y micro-animaciones.
- **Feedback en Tiempo Real**: Notificaciones y validaciones para asegurar la calidad de los datos.

## 🚀 Tecnologías Utilizadas

### Frontend
- **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilos**: [TailwindCSS](https://tailwindcss.com/) para diseño utilitario y responsivo.
- **PDFs**: `jspdf` y `jspdf-autotable` para generación de documentos en el cliente.
- **HTTP Client**: `axios` para comunicación con el backend.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Lenguaje**: TypeScript
- **Base de Datos**: MongoDB (con `mongoose` como ODM).
- **Autenticación**: JWT (JSON Web Tokens) y `bcryptjs`.

## ⚙️ Requisitos Previos

- **Node.js**: v18 o superior.
- **MongoDB**: Instancia local o conexión a MongoDB Atlas.

## 📦 Instalación y Configuración

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

La aplicación estará disponible típicamente en `http://localhost:5173`.

## 📂 Estructura del Proyecto

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
└── frontend/               # SPA con React/Vite
    ├── src/
    │   ├── components/     # Componentes UI (Forms, Tables, Layouts)
    │   ├── contexts/       # Estado global (AuthContext)
    │   ├── services/       # Capa de servicio API (axios)
    │   ├── utils/          # Generadores de PDF, formateadores
    │   ├── pages/          # Vistas principales (Dashboard, Login)
    │   └── App.tsx         # Configuración de rutas
    └── ...
```

## 🔌 API Overview

Principales grupos de endpoints disponibles en el backend:

- **Auth**: `/api/auth` (Login, Registro, Verificación de token)
- **Reportes**: `/api/reportes` (CRUD de reportes diarios)
- **Proyectos**: `/api/proyectos` (Gestión de proyectos mineros)
- **Vehículos**: `/api/vehiculos` (Gestión de flota)
- **Usuarios**: `/api/usuarios` (Administración de usuarios del sistema)

## 📜 Scripts Disponibles

### Backend
- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática.
- `npm run build`: Compila el código TypeScript a JavaScript en `dist/`.
- `npm run start`: Inicia el servidor compilado (producción).
- `npm run init`: Crea el usuario administrador inicial.

### Frontend
- `npm run dev`: Inicia el servidor de desarrollo de Vite.
- `npm run build`: Construye la aplicación para producción.
- `npm run preview`: Vista previa local de la build de producción.

---

> **Nota**: Este proyecto es propiedad privada y está diseñado para uso interno.
