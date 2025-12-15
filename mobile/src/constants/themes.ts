/**
 * Sistema de Temas - Light y Dark Mode
 * Paleta de colores consistente para toda la aplicación
 */

export interface Theme {
  // Colores principales
  primary: string;
  secondary: string;
  accent: string;

  // Estados
  success: string;
  danger: string;
  warning: string;
  info: string;

  // Fondos
  background: string;
  surface: string;
  card: string;

  // Texto
  text: string;
  textSecondary: string;
  textDisabled: string;

  // Bordes y divisores
  border: string;
  divider: string;

  // Otros
  white: string;
  black: string;
  overlay: string;

  // Estados de input
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Sombras
  shadow: string;
}

export const lightTheme: Theme = {
  // Colores principales
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#3b82f6',

  // Estados
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Fondos
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',

  // Texto
  text: '#0f172a',
  textSecondary: '#64748b',
  textDisabled: '#94a3b8',

  // Bordes y divisores
  border: '#e2e8f0',
  divider: '#e2e8f0',

  // Otros
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Estados de input
  inputBackground: '#ffffff',
  inputBorder: '#cbd5e1',
  inputPlaceholder: '#94a3b8',

  // Sombras
  shadow: '#000000',
};

export const darkTheme: Theme = {
  // Colores principales
  primary: '#3b82f6',
  secondary: '#94a3b8',
  accent: '#60a5fa',

  // Estados
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Fondos
  background: '#0f172a',
  surface: '#1e293b',
  card: '#1e293b',

  // Texto
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textDisabled: '#64748b',

  // Bordes y divisores
  border: '#334155',
  divider: '#334155',

  // Otros
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Estados de input
  inputBackground: '#1e293b',
  inputBorder: '#475569',
  inputPlaceholder: '#64748b',

  // Sombras
  shadow: '#000000',
};

// Colores que no cambian con el tema
export const STATIC_COLORS = {
  // Estos colores se mantienen igual en ambos temas
  transparent: 'transparent',

  // Gradientes
  gradientStart: '#2563eb',
  gradientEnd: '#3b82f6',
};

export type ThemeMode = 'light' | 'dark';
