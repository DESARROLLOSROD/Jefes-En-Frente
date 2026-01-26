import { supabaseAdmin } from '../config/supabase.js';

async function inspectTable() {
    console.log('🔍 Inspeccionando tabla cat_tipos_vehiculo...');

    // Consulta para obtener info de columnas desde information_schema
    const { data, error } = await supabaseAdmin
        .rpc('get_table_info', { t_name: 'cat_tipos_vehiculo' });

    if (error) {
        // Si la función RPC no existe, probamos con una consulta directa a una tabla que siempre existe
        console.log('⚠️ RPC get_table_info no disponible, intentando consulta directa...');
        const { data: cols, error: err2 } = await supabaseAdmin
            .from('cat_tipos_vehiculo')
            .select('*')
            .limit(1);

        if (err2) {
            console.error('❌ Error consultando tabla:', err2.message);
        } else {
            console.log('✅ Acceso a la tabla exitoso.');
            console.log('   Columnas encontradas en el registro:', Object.keys(cols[0] || {}).join(', '));
        }
    } else {
        console.log('✅ Información de columnas:', data);
    }
}

inspectTable();
