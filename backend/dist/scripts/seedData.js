import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Proyecto from '../models/Proyecto.js';
import * as dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI no está definida en el archivo .env');
    process.exit(1);
}
const proyectosEjemplo = [
    {
        nombre: 'Mina San Sebastián',
        ubicacion: 'SAN SEBASTIAN DEL OESTE, JALISCO, MEXICO',
        descripcion: 'Proyecto principal de extracción minera en San Sebastián del Oeste',
        activo: true
    },
    {
        nombre: 'Mina La Esperanza',
        ubicacion: 'GUADALAJARA, JALISCO, MEXICO',
        descripcion: 'Proyecto de exploración y desarrollo en zona de Guadalajara',
        activo: true
    },
    {
        nombre: 'Proyecto Cerro Verde',
        ubicacion: 'ZAPOPAN, JALISCO, MEXICO',
        descripcion: 'Proyecto de procesamiento y refinación',
        activo: true
    },
    {
        nombre: 'Mina El Progreso',
        ubicacion: 'TLAJOMULCO, JALISCO, MEXICO',
        descripcion: 'Proyecto de extracción a cielo abierto',
        activo: true
    }
];
const usuariosEjemplo = [
    {
        nombre: 'Administrador Principal',
        email: 'admin@jefesenfrente.com',
        password: 'password123',
        rol: 'admin',
        activo: true
    },
    {
        nombre: 'Supervisor Mina San Sebastián',
        email: 'supervisor@jefesenfrente.com',
        password: 'password123',
        rol: 'supervisor',
        activo: true
    },
    {
        nombre: 'Operador Juan Pérez',
        email: 'operador1@jefesenfrente.com',
        password: 'password123',
        rol: 'operador',
        activo: true
    },
    {
        nombre: 'Operadora María García',
        email: 'operador2@jefesenfrente.com',
        password: 'password123',
        rol: 'operador',
        activo: true
    }
];
const seedDatabase = async () => {
    try {
        console.log('🔗 Conectando a MongoDB...');
        console.log('📝 URI:', MONGODB_URI.replace(/:[^:]*@/, ':********@'));
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        // Limpiar base de datos existente
        console.log('🧹 Limpiando datos existentes...');
        await Usuario.deleteMany({});
        await Proyecto.deleteMany({});
        console.log('✅ Datos existentes eliminados');
        // Crear proyectos
        console.log('🏗️ Creando proyectos...');
        const proyectosCreados = await Proyecto.insertMany(proyectosEjemplo);
        console.log(`✅ ${proyectosCreados.length} proyectos creados`);
        // Crear usuarios y asignar proyectos
        console.log('👥 Creando usuarios...');
        // Admin tiene acceso a todos los proyectos
        const admin = await Usuario.create({
            ...usuariosEjemplo[0],
            proyectos: proyectosCreados.map(p => p._id)
        });
        // Supervisor tiene acceso a los primeros 2 proyectos
        const supervisor = await Usuario.create({
            ...usuariosEjemplo[1],
            proyectos: [proyectosCreados[0]._id, proyectosCreados[1]._id]
        });
        // Operadores tienen acceso a proyectos específicos
        const operador1 = await Usuario.create({
            ...usuariosEjemplo[2],
            proyectos: [proyectosCreados[0]._id]
        });
        const operador2 = await Usuario.create({
            ...usuariosEjemplo[3],
            proyectos: [proyectosCreados[1]._id, proyectosCreados[2]._id]
        });
        console.log(`✅ ${4} usuarios creados`);
        // Mostrar resumen
        console.log('\n📊 RESUMEN DE DATOS CREADOS:');
        console.log('==============================');
        console.log('\n🏗️ PROYECTOS:');
        proyectosCreados.forEach((proyecto, index) => {
            console.log(`   ${index + 1}. ${proyecto.nombre} - ${proyecto.ubicacion}`);
        });
        console.log('\n👥 USUARIOS:');
        console.log('   📧 admin@jefesenfrente.com / password123 (Admin)');
        console.log('   📧 supervisor@jefesenfrente.com / password123 (Supervisor)');
        console.log('   📧 operador1@jefesenfrente.com / password123 (Operador)');
        console.log('   📧 operador2@jefesenfrente.com / password123 (Operadora)');
        console.log('\n🎯 ¡Datos de prueba creados exitosamente!');
    }
    catch (error) {
        console.error('❌ Error creando datos de prueba:', error.message);
        if (error.code === 11000) {
            console.log('💡 Error de duplicado - probablemente los datos ya existen');
        }
    }
    finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
};
// Ejecutar el script
seedDatabase();
