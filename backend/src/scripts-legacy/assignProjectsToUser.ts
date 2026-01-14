/**
 * Script para asignar proyectos a un usuario
 *
 * Uso:
 * npx tsx src/scripts/assignProjectsToUser.ts
 */

import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase';

dotenv.config();

async function main() {
  const userEmail = 'miguel.lopez@rod.com.mx';

  console.log(`🔍 Buscando usuario: ${userEmail}`);

  // Buscar usuario
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users?.users.find(u => u.email === userEmail);

  if (!user) {
    console.error('❌ Usuario no encontrado');
    process.exit(1);
  }

  console.log(`✅ Usuario encontrado: ${user.id}`);

  // Obtener todos los proyectos
  const { data: proyectos, error: proyectosError } = await supabaseAdmin
    .from('proyectos')
    .select('id, nombre')
    .eq('activo', true);

  if (proyectosError) {
    console.error('❌ Error obteniendo proyectos:', proyectosError);
    process.exit(1);
  }

  console.log(`📂 Proyectos encontrados: ${proyectos?.length || 0}`);

  if (!proyectos || proyectos.length === 0) {
    console.log('⚠️  No hay proyectos activos');
    process.exit(0);
  }

  // Verificar asignaciones actuales
  const { data: asignaciones } = await supabaseAdmin
    .from('proyecto_usuarios')
    .select('proyecto_id')
    .eq('usuario_id', user.id);

  console.log(`📋 Asignaciones actuales: ${asignaciones?.length || 0}`);

  // Asignar todos los proyectos al usuario
  const nuevasAsignaciones = proyectos.map(p => ({
    usuario_id: user.id,
    proyecto_id: p.id
  }));

  // Eliminar asignaciones existentes
  await supabaseAdmin
    .from('proyecto_usuarios')
    .delete()
    .eq('usuario_id', user.id);

  // Insertar nuevas asignaciones
  const { error: insertError } = await supabaseAdmin
    .from('proyecto_usuarios')
    .insert(nuevasAsignaciones);

  if (insertError) {
    console.error('❌ Error asignando proyectos:', insertError);
    process.exit(1);
  }

  console.log(`✅ ${proyectos.length} proyectos asignados exitosamente`);
  proyectos.forEach(p => console.log(`   - ${p.nombre}`));
}

main()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
