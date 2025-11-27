import mongoose from 'mongoose';
const MONGODB_URI = 'mongodb+srv://miguellopez_db_user:JefesFrente2024@sjt.jn8vcf6.mongodb.net/jefes_en_frente_db?retryWrites=true&w=majority';
const createSimpleUser = async () => {
    try {
        console.log('🔗 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        const db = mongoose.connection.db;
        // Crear usuario SIN hash (password en texto plano)
        await db.collection('usuarios').insertOne({
            nombre: 'Admin Simple',
            email: 'miguel.lopez@rod.com.mx',
            password: 'admin123', // Texto plano
            rol: 'admin',
            proyectos: [],
            activo: true,
            fechaCreacion: new Date()
        });
        console.log('✅ Usuario simple creado: simple@minera.com / password123');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
};
createSimpleUser();
