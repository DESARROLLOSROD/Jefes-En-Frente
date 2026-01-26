import { supabaseAdmin } from '../config/supabase.js';

async function listTables() {
    console.log('🔍 Listando todas las tablas disponibles...');

    // En Supabase, una forma de ver tablas si no hay RPC es intentar consultar una por una o usar una tabla de sistema si se tiene permiso
    const { data, error } = await supabaseAdmin
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

    if (error) {
        console.log('⚠️ No se pudo consultar pg_tables (normal para roles no-admin).');

        // Intento manual con los catálogos conocidos
        const tablas = [
            'cat_materiales',
            'cat_origenes',
            'cat_destinos',
            'cat_capacidades',
            'cat_tipos_vehiculo'
        ];

        for (const t of tablas) {
            const { error: e } = await supabaseAdmin.from(t).select('id').limit(1);
            console.log(`Table ${t}: ${e ? '❌ ' + e.message : '✅ OK'}`);
        }
    } else {
        console.log('Tables:', data.map((t: any) => t.tablename).join(', '));
    }
}

listTables();
