import Constants from 'expo-constants';

// Configuración de la API desde variables de entorno
// Valores por defecto si no están configuradas las variables de entorno
const DEFAULT_API_URL = 'https://jefes-backend-production.up.railway.app/api';
const DEFAULT_INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos

// Obtener valores de variables de entorno con fallback
export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
export const ENV = process.env.EXPO_PUBLIC_ENV || 'production';
export const INACTIVITY_TIMEOUT = process.env.EXPO_PUBLIC_INACTIVITY_TIMEOUT
  ? parseInt(process.env.EXPO_PUBLIC_INACTIVITY_TIMEOUT, 10)
  : DEFAULT_INACTIVITY_TIMEOUT;

// Log para desarrollo (solo en modo dev)
if (__DEV__) {
  console.log('🔧 Environment Config:', {
    API_URL,
    ENV,
    INACTIVITY_TIMEOUT: `${INACTIVITY_TIMEOUT / 60000} minutos`,
  });
}

// Colores de la aplicación
// Colores de la aplicación
export const COLORS = {
  // Primary - Blue
  primary: '#2563eb', // blue-600
  primaryDark: '#1e3a8a', // blue-900 (Header)
  primaryLight: '#eff6ff', // blue-50

  // Secondary - Slate/Gray
  secondary: '#64748b',
  light: '#f8fafc',
  dark: '#0f172a',
  gray: '#94a3b8',
  white: '#ffffff',
  black: '#000000',

  // Status Colors
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Theme Specific
  orange: {
    light: '#fff7ed', // orange-50
    border: '#fb923c', // orange-400
    text: '#9a3412', // orange-800
    primary: '#ea580c', // orange-600
  },
  purple: {
    light: '#faf5ff', // purple-50
    border: '#c084fc', // purple-400
    text: '#6b21a8', // purple-800
    primary: '#9333ea', // purple-600
  },
  blue: {
    light: '#eff6ff', // blue-50
    border: '#60a5fa', // blue-400
    text: '#1e40af', // blue-800
  }
};

export const THEME = {
  card: {
    base: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    orange: {
      backgroundColor: COLORS.orange.light,
      borderColor: COLORS.orange.border,
      borderWidth: 2,
    },
    purple: {
      backgroundColor: COLORS.purple.light,
      borderColor: COLORS.purple.border,
      borderWidth: 2,
    },
    blue: {
      backgroundColor: COLORS.blue.light,
      borderColor: COLORS.blue.border,
      borderWidth: 2,
    }
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    titleColor: '#bfdbfe', // blue-200
  }
};

// Tipos de vehículos
export const TIPOS_VEHICULO = [
  'Camioneta',
  'Camión',
  'Maquinaria',
  'Otro'
];

// Turnos
export const TURNOS = [
  { label: 'Primer Turno', value: 'primer' },
  { label: 'Segundo Turno', value: 'segundo' }
];

// Roles de usuario
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  JEFE_EN_FRENTE: 'jefe en frente'
};

// Colores para pines del mapa
export const PIN_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Dark Orange
];
