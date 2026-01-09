// Obtener todas las zonas de un proyecto
export const getZonesByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        // TODO: Implementar tabla de zonas de trabajo en Supabase
        // Por ahora devolver array vacío para no romper el frontend
        console.log('⚠️ WorkZones not yet migrated to Supabase - returning empty array for project:', projectId);
        res.json({
            success: true,
            data: []
        });
    }
    catch (error) {
        console.error('Error al obtener zonas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener zonas de trabajo'
        });
    }
};
// Obtener una zona específica
export const getZoneById = async (req, res) => {
    try {
        const { zoneId } = req.params;
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(404).json({
            success: false,
            message: 'Zona de trabajo no encontrada'
        });
    }
    catch (error) {
        console.error('Error al obtener zona:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener zona de trabajo'
        });
    }
};
// Crear nueva zona
export const createZone = async (req, res) => {
    try {
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad no implementada aún en Supabase'
        });
    }
    catch (error) {
        console.error('Error al crear zona:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear zona de trabajo'
        });
    }
};
// Actualizar zona
export const updateZone = async (req, res) => {
    try {
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad no implementada aún en Supabase'
        });
    }
    catch (error) {
        console.error('Error al actualizar zona:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar zona de trabajo'
        });
    }
};
// Eliminar zona
export const deleteZone = async (req, res) => {
    try {
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad no implementada aún en Supabase'
        });
    }
    catch (error) {
        console.error('Error al eliminar zona:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar zona de trabajo'
        });
    }
};
// Agregar sección a zona
export const addSection = async (req, res) => {
    try {
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad no implementada aún en Supabase'
        });
    }
    catch (error) {
        console.error('Error al agregar sección:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar sección'
        });
    }
};
// Actualizar sección
export const updateSection = async (req, res) => {
    try {
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad no implementada aún en Supabase'
        });
    }
    catch (error) {
        console.error('Error al actualizar sección:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar sección'
        });
    }
};
// Eliminar sección
export const deleteSection = async (req, res) => {
    try {
        console.log('⚠️ WorkZones not yet migrated to Supabase');
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad no implementada aún en Supabase'
        });
    }
    catch (error) {
        console.error('Error al eliminar sección:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar sección'
        });
    }
};
