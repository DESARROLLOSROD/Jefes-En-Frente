/**
 * Exportación centralizada de todos los servicios de Supabase
 */

export { proyectosService, ProyectosService } from './proyectos.service.js';
export { usuariosService, UsuariosService } from './usuarios.service.js';
export { vehiculosService, VehiculosService } from './vehiculos.service.js';
export { reportesService, ReportesService } from './reportes.service.js';
export {
  materialesService,
  origenesService,
  destinosService,
  capacidadesService,
  tiposVehiculoService,
  MaterialesService,
  OrigenesService,
  DestinosService,
  CapacidadesService,
  TiposVehiculoService
} from './catalogos.service.js';
export { default as bibliotecaMapasService } from './bibliotecaMapas.service.js';
