/**
 * Script para verificar tablas de catálogos en Supabase
 */

import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';

dotenv.config();

async function main() {
  console.log('🔍 Verificando tablas de catálogos en Supabase...\n');

  const tablas = [
    'cat_materiales',
    'cat_origenes',
    'cat_destinos',
    'cat_capacidades',
    'cat_tipos_vehiculo'
  ];

  for (const tabla of tablas) {
    try {
      console.log(`📋 Tabla: ${tabla}`);

      const { data, error, count } = await supabaseAdmin
        .from(tabla)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Registros: ${count || 0}`);
        if (data && data.length > 0) {
          console.log(`   📄 Ejemplo:`, JSON.stringify(data[0]).substring(0, 100));
        }
      }
    } catch (error: any) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    console.log('');
  }
}

main()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
