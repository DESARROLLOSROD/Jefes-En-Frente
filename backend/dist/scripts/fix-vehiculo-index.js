import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || '';
async function fixVehiculoIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        const db = mongoose.connection.db;
        const collection = db?.collection('vehiculos');
        if (collection) {
            // Eliminar el índice antiguo 'placa_1'
            try {
                await collection.dropIndex('placa_1');
                console.log('✅ Índice "placa_1" eliminado correctamente');
            }
            catch (error) {
                if (error.code === 27) {
                    console.log('ℹ️  El índice "placa_1" no existe (ya fue eliminado)');
                }
                else {
                    throw error;
                }
            }
            // Listar índices actuales
            const indexes = await collection.indexes();
            console.log('\n📋 Índices actuales en la colección vehiculos:');
            indexes.forEach(index => {
                console.log(`  - ${index.name}:`, Object.keys(index.key));
            });
        }
        await mongoose.disconnect();
        console.log('\n✅ Script completado. Puedes crear vehículos ahora.');
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
fixVehiculoIndex();
