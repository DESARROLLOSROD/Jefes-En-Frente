import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Validadores para autenticación
export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email demasiado largo'),
  body('password')
    .isString().withMessage('Password es requerido')
    .isLength({ min: 6, max: 100 }).withMessage('Password debe tener entre 6 y 100 caracteres')
    .trim(),
  handleValidationErrors
];

// Validadores para usuarios
export const validateCreateUser = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombre solo puede contener letras'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email demasiado largo'),
  body('password')
    .isLength({ min: 6, max: 100 }).withMessage('Password debe tener entre 6 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('Password debe contener al menos una mayúscula, una minúscula y un número'),
  body('rol')
    .isIn(['admin', 'supervisor', 'jefe en frente', 'operador'])
    .withMessage('Rol inválido'),
  body('proyectos')
    .optional()
    .isArray().withMessage('Proyectos debe ser un array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every((id: any) => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    }).withMessage('IDs de proyectos inválidos'),
  handleValidationErrors
];

export const validateUpdateUser = [
  param('id').isMongoId().withMessage('ID de usuario inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Nombre solo puede contener letras'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6, max: 100 }).withMessage('Password debe tener entre 6 y 100 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'supervisor', 'jefe en frente', 'operador'])
    .withMessage('Rol inválido'),
  body('activo')
    .optional()
    .isBoolean().withMessage('Activo debe ser booleano'),
  handleValidationErrors
];

// Validadores para proyectos
export const validateCreateProject = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Nombre debe tener entre 2 y 200 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),
  body('ubicacion')
    .trim()
    .isLength({ min: 2, max: 300 }).withMessage('Ubicación debe tener entre 2 y 300 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Descripción demasiado larga'),
  body('mapa.imagen')
    .optional()
    .isString()
    .custom((value) => {
      if (value) {
        // Validar que sea base64 válido
        const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
        if (!base64Regex.test(value)) {
          throw new Error('Formato de imagen inválido');
        }
        // Limitar tamaño (aproximadamente 5MB en base64)
        if (value.length > 7000000) {
          throw new Error('Imagen demasiado grande (máximo 5MB)');
        }
      }
      return true;
    }),
  body('mapa.width')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Ancho de mapa inválido'),
  body('mapa.height')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Alto de mapa inválido'),
  handleValidationErrors
];

// Validadores para vehículos
export const validateCreateVehicle = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('tipo')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tipo debe tener entre 2 y 100 caracteres'),
  body('noEconomico')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Número económico debe tener entre 1 y 50 caracteres')
    .matches(/^[A-Z0-9\-]+$/).withMessage('Número económico solo puede contener mayúsculas, números y guiones'),
  body('horometroInicial')
    .isFloat({ min: 0, max: 999999 }).withMessage('Horómetro inicial debe ser un número entre 0 y 999999'),
  body('proyectos')
    .optional()
    .isArray().withMessage('Proyectos debe ser un array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every((id: any) => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    }).withMessage('IDs de proyectos inválidos'),
  handleValidationErrors
];

// Validadores para reportes
export const validateCreateReport = [
  body('fecha')
    .isISO8601().withMessage('Fecha inválida')
    .toDate(),
  body('proyectoId')
    .isMongoId().withMessage('ID de proyecto inválido'),
  body('ubicacion')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Ubicación demasiado larga'),
  body('turno')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Turno demasiado largo'),
  body('jefeFrente')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Jefe de frente demasiado largo'),
  body('sobrestante')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Sobrestante demasiado largo'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Observaciones demasiado largas'),
  body('controlAcarreo')
    .optional()
    .isArray().withMessage('Control de acarreo debe ser un array'),
  body('controlMaterial')
    .optional()
    .isArray().withMessage('Control de material debe ser un array'),
  body('controlAgua')
    .optional()
    .isArray().withMessage('Control de agua debe ser un array'),
  body('controlMaquinaria')
    .optional()
    .isArray().withMessage('Control de maquinaria debe ser un array'),
  body('pinesMapa')
    .optional()
    .isArray({ max: 50 }).withMessage('Máximo 50 pines permitidos')
    .custom((pines) => {
      if (pines && pines.length > 0) {
        return pines.every((pin: any) => {
          return pin.pinX >= 0 && pin.pinX <= 1 &&
                 pin.pinY >= 0 && pin.pinY <= 1 &&
                 (!pin.etiqueta || pin.etiqueta.length <= 100);
        });
      }
      return true;
    }).withMessage('Datos de pines inválidos'),
  handleValidationErrors
];

// Validadores para zonas de trabajo
export const validateCreateWorkZone = [
  body('projectId')
    .isMongoId().withMessage('ID de proyecto inválido'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Descripción demasiado larga'),
  body('sections')
    .optional()
    .isArray({ max: 100 }).withMessage('Máximo 100 secciones permitidas'),
  handleValidationErrors
];

// Validador de MongoID para params
export const validateMongoId = [
  param('id').isMongoId().withMessage('ID inválido'),
  handleValidationErrors
];

// Validador de query params
export const validateQueryParams = [
  query('proyectoId')
    .optional()
    .isMongoId().withMessage('ID de proyecto inválido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Límite debe ser entre 1 y 1000'),
  query('skip')
    .optional()
    .isInt({ min: 0 }).withMessage('Skip debe ser mayor o igual a 0'),
  handleValidationErrors
];
