import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que las variables de entorno estén configuradas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL no está definida en las variables de entorno');
}

if (!supabaseServiceRoleKey && !supabaseAnonKey) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY deben estar definidas');
}

/**
 * Cliente Supabase con Service Role Key
 * Usar para operaciones del servidor que bypasean RLS
 * (migraciones, operaciones admin, etc.)
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey!, // Fallback to anon key if service role not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Cliente Supabase con Anon Key
 * Usar para operaciones normales que respetan RLS
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceRoleKey!, // Fallback to service role if anon not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Función helper para obtener un cliente con un token de usuario específico
 * Útil para operaciones que necesitan respetar RLS con contexto de usuario
 */
export function getSupabaseClientWithAuth(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Configuración de Supabase incompleta');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Log de inicialización
console.log('✅ Cliente Supabase inicializado correctamente');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Service Role Key: ${supabaseServiceRoleKey ? 'Configurada' : 'No configurada'}`);
console.log(`🔓 Anon Key: ${supabaseAnonKey ? 'Configurada' : 'No configurada'}`);
