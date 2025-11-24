import { AuthResponse, Proyecto } from '../types/auth';

// Simula un delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 Mock login - Simulando autenticación:', { email, password });
    
    await delay(1000); // Simula delay de red
    
    // Credenciales válidas para demo
    if (email === "admin@jefesenfrente.com" && password === "password123") {
      console.log('✅ Mock login - Credenciales válidas');
      return {
        success: true,
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-jwt-token-for-development",
          user: {
            id: 1,
            email: email,
            name: "Administrador Demo",
            role: "admin",
            proyectos: []
          }
        }
      };
    }
    
    // Credenciales incorrectas
    console.log('❌ Mock login - Credenciales inválidas');
    return {
      success: false,
      error: "Credenciales incorrectas. Use: admin@jefesenfrente.com / password123"
    };
  },

  async obtenerProyectos(): Promise<{ success: boolean; data?: Proyecto[]; error?: string }> {
    console.log('📋 Mock - Obteniendo proyectos...');
    await delay(800);
    
    return {
      success: true,
      data: [
        { 
          id: 1, 
          nombre: "Mina La Esperanza", 
          codigo: "ME001",
          ubicacion: "Región Norte",
          estado: "activo"
        },
        { 
          id: 2, 
          nombre: "Proyecto Cerro Verde", 
          codigo: "CV002",
          ubicacion: "Región Sur", 
          estado: "activo"
        },
        { 
          id: 3, 
          nombre: "Mina San Antonio", 
          codigo: "SA003",
          ubicacion: "Región Este",
          estado: "en_planificacion"
        }
      ]
    };
  }
};