import { supabaseAdmin } from '../config/supabase.js';

async function listColumns() {
    const { data } = await supabaseAdmin
        .from('cat_tipos_vehiculo')
        .select('*')
        .limit(1);

    if (data && data.length > 0) {
        console.log('--- COLUMNS START ---');
        Object.keys(data[0]).forEach(k => console.log(k));
        console.log('--- COLUMNS END ---');
    } else {
        console.log('EMPTY TABLE');
    }
}

listColumns();
