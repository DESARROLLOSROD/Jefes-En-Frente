/**
 * Script de Migración de Usuarios de MongoDB a Supabase Auth
 *
 * IMPORTANTE: Este script debe ejecutarse ANTES de migrar los datos
 * porque necesita crear los usuarios en Supabase Auth primero.
 *
 * Uso:
 * npx tsx src/scripts/migrateUsersToAuth.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { supabaseAdmin } from '../config/supabase';
import Usuario from '../models/Usuario';

// Cargar variables de entorno
dotenv.config();

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Generar password temporal seguro
 */
function generateTempPassword(): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Migrar un usuario de MongoDB a Supabase Auth
 */
async function migrateUser(usuario: any, stats: MigrationStats): Promise<void> {
  try {
    console.log(`\n📋 Migrando usuario: ${usuario.email}`);

    // Verificar si el usuario ya existe en Supabase Auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === usuario.email);

    if (existingUser) {
      console.log(`⚠️  Usuario ya existe en Supabase Auth: ${usuario.email}`);

      // Verificar si el perfil existe
      const { data: perfil } = await supabaseAdmin
        .from('perfiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      if (!perfil) {
        console.log(`📝 Creando perfil para usuario existente`);
        await supabaseAdmin
          .from('perfiles')
          .insert({
            id: existingUser.id,
            nombre: usuario.nombre,
            rol: usuario.rol || 'jefe en frente',
            activo: usuario.activo !== undefined ? usuario.activo : true
          });
      }

      // Migrar proyectos
      if (usuario.proyectos && usuario.proyectos.length > 0) {
        console.log(`📂 Asignando ${usuario.proyectos.length} proyectos`);

        // Eliminar asignaciones existentes
        await supabaseAdmin
          .from('proyecto_usuarios')
          .delete()
          .eq('usuario_id', existingUser.id);

        // Insertar nuevas asignaciones
        const proyectoInserts = usuario.proyectos.map((proyectoId: string) => ({
          usuario_id: existingUser.id,
          proyecto_id: proyectoId
        }));

        await supabaseAdmin
          .from('proyecto_usuarios')
          .insert(proyectoInserts);
      }

      stats.skipped++;
      console.log(`✅ Usuario actualizado (ya existía)`);
      return;
    }

    // Generar password temporal
    const tempPassword = generateTempPassword();
    console.log(`🔑 Password temporal generado: ${tempPassword}`);
    console.log(`   ⚠️  IMPORTANTE: El usuario deberá cambiar su password en el primer login`);

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: usuario.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nombre: usuario.nombre,
        rol: usuario.rol || 'jefe en frente',
        migrated_from_mongodb: true,
        temp_password: true // Flag para forzar cambio de password
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Error creando usuario en Auth: ${authError?.message}`);
    }

    console.log(`✅ Usuario creado en Supabase Auth con ID: ${authData.user.id}`);

    // Crear perfil (aunque el trigger debería hacerlo, lo hacemos explícito)
    const { error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .insert({
        id: authData.user.id,
        nombre: usuario.nombre,
        rol: usuario.rol || 'jefe en frente',
        activo: usuario.activo !== undefined ? usuario.activo : true
      });

    if (perfilError) {
      // Si ya existe por el trigger, está bien
      if (perfilError.code !== '23505') { // Duplicate key error
        console.warn(`⚠️  Error creando perfil (puede ser normal si el trigger ya lo creó):`, perfilError.message);
      }
    } else {
      console.log(`✅ Perfil creado`);
    }

    // Migrar proyectos
    if (usuario.proyectos && usuario.proyectos.length > 0) {
      console.log(`📂 Asignando ${usuario.proyectos.length} proyectos`);

      const proyectoInserts = usuario.proyectos.map((proyectoId: string) => ({
        usuario_id: authData.user.id,
        proyecto_id: proyectoId
      }));

      const { error: proyectosError } = await supabaseAdmin
        .from('proyecto_usuarios')
        .insert(proyectoInserts);

      if (proyectosError) {
        console.warn(`⚠️  Error asignando proyectos:`, proyectosError.message);
      } else {
        console.log(`✅ Proyectos asignados`);
      }
    }

    // Guardar el password temporal en un archivo (para enviarlo a los usuarios)
    // IMPORTANTE: Este archivo debe ser manejado de forma segura
    const fs = await import('fs');
    const path = await import('path');
    const passwordsFile = path.join(process.cwd(), 'temp_passwords.txt');

    fs.appendFileSync(
      passwordsFile,
      `${usuario.email},${tempPassword}\n`
    );

    stats.successful++;
    console.log(`✅ Usuario migrado exitosamente`);

  } catch (error: any) {
    console.error(`❌ Error migrando usuario ${usuario.email}:`, error.message);
    stats.failed++;
    stats.errors.push({
      email: usuario.email,
      error: error.message
    });
  }
}

/**
 * Función principal de migración
 */
async function main() {
  console.log('🚀 Iniciando migración de usuarios de MongoDB a Supabase Auth\n');

  const stats: MigrationStats = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurada');
    }

    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de Supabase no configuradas');
    }
    console.log('✅ Cliente Supabase configurado\n');

    // Obtener usuarios de MongoDB
    console.log('📋 Obteniendo usuarios de MongoDB...');
    const usuarios = await Usuario.find().sort({ fechaCreacion: 1 });
    stats.total = usuarios.length;
    console.log(`✅ ${usuarios.length} usuarios encontrados\n`);

    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios para migrar');
      return;
    }

    // Migrar cada usuario
    for (let i = 0; i < usuarios.length; i++) {
      console.log(`\n[${ i + 1}/${usuarios.length}] ============================================`);
      await migrateUser(usuarios[i], stats);
    }

    // Resumen final
    console.log('\n\n📊 ============================================');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('📊 ============================================');
    console.log(`📋 Total de usuarios: ${stats.total}`);
    console.log(`✅ Migrados exitosamente: ${stats.successful}`);
    console.log(`⚠️  Usuarios que ya existían: ${stats.skipped}`);
    console.log(`❌ Fallidos: ${stats.failed}`);
    console.log('📊 ============================================\n');

    if (stats.errors.length > 0) {
      console.log('❌ ERRORES:');
      stats.errors.forEach(({ email, error }) => {
        console.log(`   - ${email}: ${error}`);
      });
      console.log('');
    }

    if (stats.successful > 0) {
      console.log('🔑 ============================================');
      console.log('🔑 IMPORTANTE: PASSWORDS TEMPORALES');
      console.log('🔑 ============================================');
      console.log('📄 Los passwords temporales se guardaron en: temp_passwords.txt');
      console.log('⚠️  IMPORTANTE:');
      console.log('   1. Envía estos passwords a los usuarios de forma segura');
      console.log('   2. Pídeles que cambien su password en el primer login');
      console.log('   3. Elimina el archivo temp_passwords.txt después de enviarlos');
      console.log('🔑 ============================================\n');
    }

  } catch (error: any) {
    console.error('\n❌ Error fatal en la migración:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Desconectar de MongoDB
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

// Ejecutar script
main()
  .then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
