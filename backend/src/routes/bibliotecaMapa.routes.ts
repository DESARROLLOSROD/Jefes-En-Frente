import { Router, Request, Response } from 'express';
import BibliotecaMapa from '../models/BibliotecaMapa.js';
import { authMiddleware as auth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Obtener todos los mapas de la biblioteca (públicos + propios)
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;

    // Obtener mapas públicos o creados por el usuario
    const mapas = await BibliotecaMapa.find({
      $or: [
        { esPublico: true },
        { creadoPor: usuarioId }
      ]
    }).sort({ fechaCreacion: -1 });

    res.json({ success: true, data: mapas });
  } catch (error) {
    console.error('Error al obtener biblioteca de mapas:', error);
    res.status(500).json({ success: false, error: 'ERROR AL OBTENER BIBLIOTECA DE MAPAS' });
  }
});

// Obtener mapas por categoría
router.get('/categoria/:categoria', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { categoria } = req.params;

    const mapas = await BibliotecaMapa.find({
      categoria,
      $or: [
        { esPublico: true },
        { creadoPor: usuarioId }
      ]
    }).sort({ fechaCreacion: -1 });

    res.json({ success: true, data: mapas });
  } catch (error) {
    console.error('Error al obtener mapas por categoría:', error);
    res.status(500).json({ success: false, error: 'ERROR AL OBTENER MAPAS' });
  }
});

// Crear nuevo mapa en biblioteca
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { nombre, descripcion, categoria, imagen, width, height, etiquetas, esPublico, proyectoId } = req.body;

    const nuevoMapa = new BibliotecaMapa({
      nombre,
      descripcion,
      categoria,
      imagen,
      width,
      height,
      etiquetas: etiquetas || [],
      esPublico: esPublico || false,
      creadoPor: usuarioId,
      proyectoId
    });

    await nuevoMapa.save();
    res.json({ success: true, data: nuevoMapa });
  } catch (error) {
    console.error('Error al crear mapa en biblioteca:', error);
    res.status(500).json({ success: false, error: 'ERROR AL CREAR MAPA' });
  }
});

// Eliminar mapa de biblioteca
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as AuthRequest).user?.userId;
    const { id } = req.params;

    const mapa = await BibliotecaMapa.findById(id);

    if (!mapa) {
      return res.status(404).json({ success: false, error: 'MAPA NO ENCONTRADO' });
    }

    // Solo el creador puede eliminar el mapa
    if (mapa.creadoPor !== usuarioId) {
      return res.status(403).json({ success: false, error: 'NO TIENE PERMISOS PARA ELIMINAR ESTE MAPA' });
    }

    await BibliotecaMapa.findByIdAndDelete(id);
    res.json({ success: true, message: 'MAPA ELIMINADO' });
  } catch (error) {
    console.error('Error al eliminar mapa:', error);
    res.status(500).json({ success: false, error: 'ERROR AL ELIMINAR MAPA' });
  }
});

export default router;
