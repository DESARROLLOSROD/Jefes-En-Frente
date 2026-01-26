import { reportesService } from '../services/reportes.service.js';
import { supabaseAdmin } from '../config/supabase.js';

async function verify() {
    console.log('🔍 Verificando datos de reportes...');

    // Obtener el último reporte con personal
    const { data: repPers } = await supabaseAdmin
        .from('reporte_personal')
        .select('reporte_id')
        .limit(1)
        .single();

    if (!repPers) {
        console.log('⚠️ No se encontró personal asignado en ningún reporte para probar.');
        process.exit(0);
    }

    console.log(`Reporte ID a probar: ${repPers.reporte_id}`);

    try {
        const reporte = await reportesService.getReporteById(repPers.reporte_id);

        if (!reporte) {
            console.error('❌ No se pudo obtener el reporte');
            process.exit(1);
        }

        if (reporte.personalAsignado && reporte.personalAsignado.length > 0) {
            const p = reporte.personalAsignado[0] as any;
            console.log('✅ Personal encontrado en reporte:');
            console.log(`   - Nombre: ${p.personal?.nombreCompleto || 'MISSING'}`);
            console.log(`   - Cargo: ${p.cargo?.nombre || 'MISSING'}`);

            if (p.personal?.nombreCompleto && p.cargo?.nombre) {
                console.log('\n🚀 ¡VERIFICACIÓN EXITOSA! Los joins funcionan correctamente.');
            } else {
                console.error('\n❌ ERROR: Los joins no devolvieron los datos esperados.');
            }
        } else {
            console.error('❌ ERROR: El reporte no devolvió personal asignado.');
        }
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    }
}

verify();
