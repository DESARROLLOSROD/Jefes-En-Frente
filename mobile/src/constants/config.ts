// Configuración de la API
// Cambia esta URL según tu entorno
export const API_URL = 'https://jefes-backend-production.up.railway.app/api'; // Railway production
// Para desarrollo local con emulador Android: 'http://10.0.2.2:5000/api'
// Para desarrollo local con dispositivo físico: 'http://TU_IP_LOCAL:5000/api'

// Timeout de inactividad (15 minutos en ms)
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

// Colores de la aplicación
export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#0f172a',
  gray: '#94a3b8',
  white: '#ffffff',
  black: '#000000',
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
