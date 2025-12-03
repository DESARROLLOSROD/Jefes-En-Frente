import express from 'express';
import { getZonesByProject, getZoneById, createZone, updateZone, deleteZone, addSection, updateSection, deleteSection } from '../controllers/workZone.controller.js';
import { verificarToken, verificarAdminOSupervisor } from './auth.js';
export const workZoneRouter = express.Router();
// Middleware de autenticación para todas las rutas
workZoneRouter.use(verificarToken);
// Rutas de zonas de trabajo
workZoneRouter.get('/projects/:projectId/zones', getZonesByProject);
workZoneRouter.get('/zones/:zoneId', getZoneById);
workZoneRouter.post('/zones', verificarAdminOSupervisor, createZone);
workZoneRouter.put('/zones/:zoneId', verificarAdminOSupervisor, updateZone);
workZoneRouter.delete('/zones/:zoneId', verificarAdminOSupervisor, deleteZone);
// Rutas de secciones
workZoneRouter.post('/zones/:zoneId/sections', verificarAdminOSupervisor, addSection);
workZoneRouter.put('/zones/:zoneId/sections/:sectionId', verificarAdminOSupervisor, updateSection);
workZoneRouter.delete('/zones/:zoneId/sections/:sectionId', verificarAdminOSupervisor, deleteSection);
