/**
 * Script de prueba para verificar que el endpoint de usuarios funciona
 */

import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';
import { usuariosService } from '../services/usuarios.service.js';

dotenv.config();

async function main() {
  console.log('🔍 Verificando usuarios en Supabase...\n');

  // 1. Verificar usuarios en Auth
  console.log('1️⃣ Usuarios en Supabase Auth:');
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error obteniendo usuarios de Auth:', authError);
  } else {
    console.log(`✅ Total usuarios en Auth: ${authUsers.users.length}`);
    authUsers.users.forEach(u => {
      console.log(`   - ${u.email} (ID: ${u.id})`);
    });
  }

  console.log('\n2️⃣ Perfiles en tabla perfiles:');
  const { data: perfiles, error: perfilesError } = await supabaseAdmin
    .from('perfiles')
    .select('*');

  if (perfilesError) {
    console.error('❌ Error obteniendo perfiles:', perfilesError);
  } else {
    console.log(`✅ Total perfiles: ${perfiles?.length || 0}`);
    perfiles?.forEach(p => {
      console.log(`   - ${p.nombre} (${p.rol}) - ID: ${p.id}`);
    });
  }

  console.log('\n3️⃣ Probando usuariosService.getUsuarios():');
  try {
    const usuarios = await usuariosService.getUsuarios();
    console.log(`✅ Total usuarios retornados: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(`   - ${u.nombre} (${u.rol}) - Proyectos: ${u.proyectos?.length || 0}`);
    });
  } catch (error) {
    console.error('❌ Error en usuariosService:', error);
  }

  console.log('\n4️⃣ Verificando RLS policies en tabla perfiles:');
  const { data: policies, error: policiesError } = await supabaseAdmin
    .rpc('pg_policies')
    .select('*')
    .eq('tablename', 'perfiles');

  if (policiesError) {
    console.log('⚠️  No se pudieron obtener policies (puede ser normal)');
  } else {
    console.log(`✅ Policies encontradas: ${policies?.length || 0}`);
  }
}

main()
  .then(() => {
    console.log('\n✅ Prueba completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
