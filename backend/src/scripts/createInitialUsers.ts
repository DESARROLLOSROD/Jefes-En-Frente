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

const createInitialData = async () => {
    try {
        console.log('🔗 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existen proyectos
        const proyectosExistentes = await Proyecto.countDocuments();

        if (proyectosExistentes === 0) {
            console.log('🏗️ Creando proyectos de ejemplo...');
            const proyectos = await Proyecto.insertMany([
                {
                    nombre: 'Mina San Sebastián',
                    ubicacion: 'SAN SEBASTIAN DEL OESTE, JALISCO, MEXICO',
                    descripcion: 'Proyecto principal de extracción minera',
                    activo: true
                },
                {
                    nombre: 'Mina La Esperanza',
                    ubicacion: 'GUADALAJARA, JALISCO, MEXICO',
                    descripcion: 'Proyecto de exploración y desarrollo',
                    activo: true
                }
            ]);
            console.log(`✅ ${proyectos.length} proyectos creados`);
        } else {
            console.log(`ℹ️ Ya existen ${proyectosExistentes} proyectos en la base de datos`);
        }

        // Obtener todos los proyectos
        const todosLosProyectos = await Proyecto.find({ activo: true });

        // Verificar si ya existe un usuario admin
        const adminExistente = await Usuario.findOne({ email: 'admin@jefesenfrente.com' });

        if (!adminExistente) {
            console.log('👤 Creando usuario administrador...');
            const admin = await Usuario.create({
                nombre: 'Administrador Principal',
                email: 'admin@jefesenfrente.com',
                password: 'admin123',
                rol: 'admin',
                proyectos: todosLosProyectos.map(p => p._id),
                activo: true
            });
            console.log('✅ Usuario admin creado');
        } else {
            console.log('ℹ️ Usuario admin ya existe');
        }

        // Verificar si ya existe un supervisor
        const supervisorExistente = await Usuario.findOne({ email: 'supervisor@jefesenfrente.com' });

        if (!supervisorExistente && todosLosProyectos.length > 0) {
            console.log('👤 Creando usuario supervisor...');
            await Usuario.create({
                nombre: 'Supervisor General',
                email: 'supervisor@jefesenfrente.com',
                password: 'supervisor123',
                rol: 'supervisor',
                proyectos: [todosLosProyectos[0]._id],
                activo: true
            });
            console.log('✅ Usuario supervisor creado');
        } else {
            console.log('ℹ️ Usuario supervisor ya existe o no hay proyectos');
        }

        // Verificar si ya existe un operador
        const operadorExistente = await Usuario.findOne({ email: 'operador@jefesenfrente.com' });

        if (!operadorExistente && todosLosProyectos.length > 0) {
            console.log('👤 Creando usuario operador...');
            await Usuario.create({
                nombre: 'Operador de Campo',
                email: 'operador@jefesenfrente.com',
                password: 'operador123',
                rol: 'operador',
                proyectos: [todosLosProyectos[0]._id],
                activo: true
            });
            console.log('✅ Usuario operador creado');
        } else {
            console.log('ℹ️ Usuario operador ya existe o no hay proyectos');
        }

        // Mostrar resumen
        const totalUsuarios = await Usuario.countDocuments();
        const totalProyectos = await Proyecto.countDocuments();

        console.log('\n📊 RESUMEN:');
        console.log('==============================');
        console.log(`👥 Total de usuarios: ${totalUsuarios}`);
        console.log(`🏗️ Total de proyectos: ${totalProyectos}`);

        console.log('\n🔑 CREDENCIALES DE ACCESO:');
        console.log('==============================');
        console.log('📧 Admin:      admin@jefesenfrente.com / admin123');
        console.log('📧 Supervisor: supervisor@jefesenfrente.com / supervisor123');
        console.log('📧 Operador:   operador@jefesenfrente.com / operador123');

        console.log('\n✅ ¡Proceso completado exitosamente!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
};

// Ejecutar el script
createInitialData();
