/**
 * Script para hacer un usuario admin
 *
 * Uso:
 * npx tsx src/scripts/makeUserAdmin.ts
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

  // Actualizar rol a admin
  const { error } = await supabaseAdmin
    .from('perfiles')
    .update({ rol: 'admin' })
    .eq('id', user.id);

  if (error) {
    console.error('❌ Error actualizando rol:', error);
    process.exit(1);
  }

  console.log('✅ Rol actualizado a admin');

  // Verificar
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('📋 Perfil actual:', perfil);
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
