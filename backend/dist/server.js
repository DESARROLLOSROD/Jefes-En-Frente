import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { reporteRouter } from './routes/reportes.js';
import { authRouter } from './routes/auth.js';
import { usuariosRouter } from './routes/usuarios.js';
import { proyectosRouter } from './routes/proyectos.js';
import { vehiculosRouter } from './routes/vehiculos.js';
dotenv.config();
const app = express();
// CORS más permisivo para desarrollo
app.use(cors({
    origin: 'http://localhost:3000', // URL exacta del frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
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
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API Jefes en Frente funcionando!',
        version: '2.0',
        features: ['Autenticación JWT', 'Múltiples Proyectos', 'Gestión de Usuarios']
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🎯 Servidor corriendo en puerto ${PORT}`);
    console.log(`🏗️ Jefes en Frente - Sistema de Gestión Minera v2.0`);
    console.log(`🔐 Sistema de autenticación activo`);
});
