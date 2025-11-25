import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ReporteActividades from '../src/models/ReporteActividades.js';

dotenv.config();

async function checkReports() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Conectado a MongoDB\n');

        // Contar todos los reportes
        const totalReportes = await ReporteActividades.countDocuments();
        console.log(`📊 Total de reportes en la base de datos: ${totalReportes}\n`);

        // Obtener todos los reportes
        const reportes = await ReporteActividades.find().sort({ fecha: -1 }).limit(10);

        console.log('📋 Últimos reportes:');
        reportes.forEach((reporte, index) => {
            console.log(`\n${index + 1}. Reporte ID: ${reporte._id}`);
            console.log(`   Fecha: ${reporte.fecha}`);
            console.log(`   Usuario ID: ${reporte.usuarioId}`);
            console.log(`   Proyecto ID: ${reporte.proyectoId}`);
            console.log(`   Zona: ${reporte.zonaTrabajo}`);
            console.log(`   Jefe: ${reporte.jefeFrente}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Desconectado de MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkReports();
