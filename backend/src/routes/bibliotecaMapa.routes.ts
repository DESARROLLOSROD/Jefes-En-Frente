import { Router, Request, Response } from 'express';
import { verificarToken as auth, AuthRequest } from '../middleware/auth.js';
import bibliotecaMapasService from '../services/bibliotecaMapas.service.js';

const router = Router();

// Obtener todos los mapas de la biblioteca (públicos + propios)
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    const mapas = await bibliotecaMapasService.obtenerMapas(usuarioId);
    res.json({ success: true, data: mapas });
  } catch (error: any) {
    console.error('Error al obtener biblioteca de mapas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL OBTENER BIBLIOTECA DE MAPAS'
    });
  }
});

// Obtener mapas por categoría
router.get('/categoria/:categoria', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { categoria } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    const mapas = await bibliotecaMapasService.obtenerMapasPorCategoria(categoria, usuarioId);
    res.json({ success: true, data: mapas });
  } catch (error: any) {
    console.error('Error al obtener mapas por categoría:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL OBTENER MAPAS'
    });
  }
});

// Obtener mapas de un proyecto específico
router.get('/proyecto/:proyectoId', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { proyectoId } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    const mapas = await bibliotecaMapasService.obtenerMapasDeProyecto(proyectoId, usuarioId);
    res.json({ success: true, data: mapas });
  } catch (error: any) {
    console.error('Error al obtener mapas del proyecto:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL OBTENER MAPAS DEL PROYECTO'
    });
  }
});

// Buscar mapas por etiquetas
router.post('/buscar-etiquetas', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { etiquetas } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    if (!Array.isArray(etiquetas)) {
      return res.status(400).json({
        success: false,
        error: 'ETIQUETAS DEBE SER UN ARRAY'
      });
    }

    const mapas = await bibliotecaMapasService.buscarPorEtiquetas(etiquetas, usuarioId);
    res.json({ success: true, data: mapas });
  } catch (error: any) {
    console.error('Error al buscar mapas por etiquetas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL BUSCAR MAPAS'
    });
  }
});

// Obtener mapa por ID
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    const mapa = await bibliotecaMapasService.obtenerMapaPorId(id, usuarioId);

    if (!mapa) {
      return res.status(404).json({ success: false, error: 'MAPA NO ENCONTRADO' });
    }

    res.json({ success: true, data: mapa });
  } catch (error: any) {
    console.error('Error al obtener mapa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL OBTENER MAPA'
    });
  }
});

// Crear nuevo mapa en biblioteca
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    const { nombre, descripcion, categoria, imagen, width, height, etiquetas, esPublico, proyectoId } = req.body;

    // Validación básica
    if (!nombre || !descripcion || !imagen?.data || !imagen?.contentType || !width || !height) {
      return res.status(400).json({
        success: false,
        error: 'FALTAN CAMPOS REQUERIDOS (nombre, descripcion, imagen, width, height)'
      });
    }

    const nuevoMapa = await bibliotecaMapasService.crearMapa({
      nombre,
      descripcion,
      categoria: categoria || 'GENERAL',
      imagen_data: imagen.data,
      imagen_content_type: imagen.contentType,
      width,
      height,
      etiquetas: etiquetas || [],
      es_publico: esPublico || false,
      proyecto_id: proyectoId
    }, usuarioId);

    res.json({ success: true, data: nuevoMapa });
  } catch (error: any) {
    console.error('Error al crear mapa en biblioteca:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL CREAR MAPA'
    });
  }
});

// Actualizar mapa existente
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    const { nombre, descripcion, categoria, imagen, width, height, etiquetas, esPublico, proyectoId } = req.body;

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (imagen?.data !== undefined) updateData.imagen_data = imagen.data;
    if (imagen?.contentType !== undefined) updateData.imagen_content_type = imagen.contentType;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (etiquetas !== undefined) updateData.etiquetas = etiquetas;
    if (esPublico !== undefined) updateData.es_publico = esPublico;
    if (proyectoId !== undefined) updateData.proyecto_id = proyectoId;

    const mapaActualizado = await bibliotecaMapasService.actualizarMapa(id, updateData, usuarioId);
    res.json({ success: true, data: mapaActualizado });
  } catch (error: any) {
    console.error('Error al actualizar mapa:', error);

    if (error.message === 'MAPA NO ENCONTRADO') {
      return res.status(404).json({ success: false, error: error.message });
    }

    if (error.message === 'NO TIENE PERMISOS PARA MODIFICAR ESTE MAPA') {
      return res.status(403).json({ success: false, error: error.message });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL ACTUALIZAR MAPA'
    });
  }
});

// Eliminar mapa de biblioteca
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'NO AUTENTICADO' });
    }

    await bibliotecaMapasService.eliminarMapa(id, usuarioId);
    res.json({ success: true, message: 'MAPA ELIMINADO' });
  } catch (error: any) {
    console.error('Error al eliminar mapa:', error);

    if (error.message === 'MAPA NO ENCONTRADO') {
      return res.status(404).json({ success: false, error: error.message });
    }

    if (error.message === 'NO TIENE PERMISOS PARA ELIMINAR ESTE MAPA') {
      return res.status(403).json({ success: false, error: error.message });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'ERROR AL ELIMINAR MAPA'
    });
  }
});

export default router;
