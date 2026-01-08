import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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
import { origenesRouter } from './routes/origenes.js';
import { destinosRouter } from './routes/destinos.js';
import { sanitizeInput, preventInjection } from './middleware/sanitizer.js';
import { apiLimiter } from './middleware/rateLimiter.js';
dotenv.config();
const app = express();
// Helmet para headers de seguridad
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP para permitir la carga de recursos
    crossOriginEmbedderPolicy: false
}));
// Cookie parser (debe ir antes de las rutas)
app.use(cookieParser());
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
        console.log('🔍 Request Origin:', origin);
        // En producción, validar origins
        if (process.env.NODE_ENV === 'production') {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('No permitido por CORS'));
            }
        }
        else {
            // En desarrollo, permitir todo
            callback(null, true);
        }
    },
    credentials: true, // Importante para cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar pre-flight explícitamente
// Parsers con límites
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Middleware de seguridad global
app.use(preventInjection); // Prevenir inyecciones NoSQL
app.use(sanitizeInput); // Sanitizar inputs
// Rate limiting global
app.use('/api/', apiLimiter);
// Verificar configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Variables de Supabase no configuradas (SUPABASE_URL, SUPABASE_ANON_KEY)');
    console.error('⚠️  Por favor, configura las credenciales en el archivo .env');
    process.exit(1);
}
console.log('✅ Cliente Supabase configurado correctamente');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
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
app.use('/api/origenes', origenesRouter);
app.use('/api/destinos', destinosRouter);
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API Jefes en Frente funcionando!',
        version: '3.0',
        database: 'Supabase PostgreSQL',
        features: ['Supabase Auth', 'Row Level Security', 'Múltiples Proyectos', 'Gestión de Usuarios']
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
