import { supabaseAdmin } from '../config/supabase.js';

async function listColumns() {
    console.log('🔍 Listando columnas de cat_tipos_vehiculo...');
    const { data, error } = await supabaseAdmin
        .from('cat_tipos_vehiculo')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        if (data.length > 0) {
            console.log('COLUMNS FOUND:', Object.keys(data[0]).join(', '));
        } else {
            console.log('⚠️ No hay registros para inspeccionar columnas via select *');

            // Intentar insertar un registro ficticio y ver si falla por falta de columna
            console.log('Intentando insertar registro de prueba...');
            const { error: insError } = await supabaseAdmin
                .from('cat_tipos_vehiculo')
                .insert({ nombre: 'TEST_PROBE_' + Date.now() });

            if (insError) {
                console.error('❌ Error al insertar:', insError.message);
            } else {
                console.log('✅ Inserción exitosa. La columna "nombre" existe.');
            }
        }
    }
}

listColumns();
