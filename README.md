# Jefes-En-Frente

## Descripción del proyecto

Esta aplicación web **Jefes-En-Frente** permite a los operadores gestionar y reportar actividades diarias de control de recursos como agua, material y acarreo. El objetivo principal es facilitar la captura, edición y generación de reportes en formato PDF, con roles diferenciados (operador y administrador) que limitan o habilitan funcionalidades específicas.

## Funcionalidades clave

- **Creación y edición de reportes** de control de agua, material y acarreo.
- **Generación de PDFs** personalizados para cada reporte y un reporte general consolidado.
- **Control de permisos**: los operadores solo pueden crear y descargar reportes, mientras que los administradores pueden editar y eliminar.
- **Interfaz dinámica** con componentes reutilizables y micro‑animaciones para una mejor experiencia de usuario.

## Tecnologías usadas

- **Frontend**: React, TypeScript, Vite.
- **Backend**: Node.js, Express, TypeScript.
- **Generación de PDFs**: pdf-lib (u otra librería similar).
- **Estilos**: CSS modular con enfoque en diseño premium y responsivo.

## Estructura del Proyecto

El proyecto está organizado en dos directorios principales: `backend` y `frontend`.

```
Jefes-En-Frente/
├── backend/                # Servidor Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Middlewares (auth, validación)
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Definición de endpoints API
│   │   ├── scripts/        # Scripts de mantenimiento
│   │   ├── types/          # Tipos TypeScript
│   │   └── server.ts       # Entry point del servidor
│   ├── Dockerfile
│   └── package.json
│
└── frontend/               # Cliente React/Vite
    ├── src/
    │   ├── components/     # Componentes UI reutilizables
    │   ├── contexts/       # Estado global (React Context)
    │   ├── services/       # Comunicación con API
    │   ├── types/          # Interfaces TypeScript
    │   ├── utils/          # Funciones auxiliares
    │   ├── App.tsx         # Componente principal
    │   └── main.tsx        # Entry point React
    ├── Dockerfile
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.ts
```

### Descripción de Directorios

### Backend (`/backend`)

El backend está construido con Node.js y Express, utilizando TypeScript.

- **`src/server.ts`**: Punto de entrada de la aplicación.
- **`src/routes`**: Definición de las rutas de la API (endpoints).
- **`src/controllers`** (o lógica en rutas): Manejo de la lógica de negocio.
- **`src/models`**: Modelos de datos (interacción con base de datos o estructuras en memoria).
- **`src/middleware`**: Middlewares para validación, autenticación y manejo de errores.
- **`src/types`**: Definiciones de tipos TypeScript compartidos.
- **`src/scripts`**: Scripts de utilidad para mantenimiento o configuración.

### Frontend (`/frontend`)

El frontend es una SPA (Single Page Application) construida con React y Vite.

- **`src/main.tsx`**: Punto de entrada de React.
- **`src/App.tsx`**: Componente raíz y configuración de rutas.
- **`src/components`**: Componentes de UI reutilizables (botones, formularios, tablas, etc.).
- **`src/pages`** (o vistas en componentes): Vistas principales de la aplicación.
- **`src/services`**: Módulos para la comunicación con la API del backend.
- **`src/contexts`**: Contextos de React para manejo de estado global (ej. autenticación).
- **`src/utils`**: Funciones de utilidad y helpers.
- **`src/types`**: Definiciones de interfaces y tipos para TypeScript.
- **`src/constants`**: Valores constantes y configuración estática.
- **`src/App.css` / `index.css`**: Estilos globales y específicos de la app.

---

> **Nota**: Este proyecto está en continuo desarrollo. Consulte la documentación interna para más detalles sobre la arquitectura y los próximos pasos.
