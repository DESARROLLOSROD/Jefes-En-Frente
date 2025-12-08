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
import { materialesRouter } from './routes/materiales.js';
import { capacidadesRouter } from './routes/capacidades.js';
import tiposVehiculoRouter from './routes/tiposVehiculo.js';
dotenv.config();
const app = express();
// CORS configurado para desarrollo y producción
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);
console.log('🔧 CORS Config loaded:', {
    allowedOrigins,
    envFrontend: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV
});
// CORS Config with Logging
const corsOptions = {
    origin: (origin, callback) => {
        // Log para ver EXACTAMENTE qué llega
        console.log('🔍 MODO PERMISIVO - Request Origin:', origin);
        // Permitir todo (para debug)
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar pre-flight explícitamente
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
    .catch((err) => {
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
app.use('/api/materiales', materialesRouter);
app.use('/api/capacidades', capacidadesRouter);
app.use('/api/tipos-vehiculo', tiposVehiculoRouter);
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API Jefes en Frente funcionando!',
        version: '2.0',
        features: ['Autenticación JWT', 'Múltiples Proyectos', 'Gestión de Usuarios']
    });
});
const PORT = Number(process.env.PORT) || 5000;
// Iniciar el servidor (Railway y desarrollo)
// IMPORTANTE: Usar '::' para permitir IPv6 e IPv4 (dual stack)
const server = app.listen(PORT, '::', () => {
    const address = server.address();
    console.log(`🎯 Servidor corriendo. Detalles (IPv6/Dual):`, address);
    console.log(`🏗️ Jefes en Frente - Sistema de Gestión Minera v2.0`);
    console.log(`🔐 Sistema de autenticación activo`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
// Exportar la app
export default app;
