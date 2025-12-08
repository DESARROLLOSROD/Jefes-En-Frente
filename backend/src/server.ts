import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { reporteRouter } from './routes/reportes.js';
import { authRouter } from './routes/auth.js';
import { usuariosRouter } from './routes/usuarios.js';
import { proyectosRouter } from './routes/proyectos.js';
import { vehiculosRouter } from './routes/vehiculos.js';
import { workZoneRouter } from './routes/workZone.routes.js';
import bibliotecaMapaRouter from './routes/bibliotecaMapa.routes.js';

dotenv.config();

const app = express();

// CORS configurado para desarrollo y producción
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL // URL del frontend en Railway
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err: Error) => {
    console.error('❌ Error conectando a MongoDB Atlas:', err.message);
    process.exit(1);
  });

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/reportes', reporteRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/proyectos', proyectosRouter);
app.use('/api/vehiculos', vehiculosRouter);
app.use('/api', workZoneRouter);
app.use('/api/biblioteca-mapas', bibliotecaMapaRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Jefes en Frente funcionando!',
    version: '2.0',
    features: ['Autenticación JWT', 'Múltiples Proyectos', 'Gestión de Usuarios']
  });
});

const PORT = process.env.PORT || 5000;

// Iniciar el servidor (Railway y desarrollo)
app.listen(PORT, () => {
  console.log(`🎯 Servidor corriendo en puerto ${PORT}`);
  console.log(`🏗️ Jefes en Frente - Sistema de Gestión Minera v2.0`);
  console.log(`🔐 Sistema de autenticación activo`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Exportar la app
export default app;