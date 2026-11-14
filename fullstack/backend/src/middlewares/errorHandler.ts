/**
 * MIDDLEWARE DE ERRORES
 *
 * Manejo de errores centralizado: todos los errores del backend terminan acá.
 *   - Los services lanzan errores con throw (AppError con su código HTTP).
 *   - Los controllers los atrapan con catch y los derivan con next(error).
 *   - Este middleware decide el código y el mensaje, y responde siempre con el mismo formato:
 *     { status, success: false, message, data: null }
 *
 * Express lo reconoce como middleware de errores porque recibe 4 parámetros (error, req, res, next).
 */
import type { Request, Response, NextFunction } from 'express';
import { ConnectionError, ConnectionTimedOutError } from 'sequelize';
import { AppError } from '../errors/AppError.js';

// Mensaje que ve el usuario cuando MySQL no responde (también lo usa /api/health en app.ts)
export const DB_UNAVAILABLE_MESSAGE = 'No hay conexión con la base de datos. Intentá de nuevo en unos minutos.';

/**
 * true si el error es porque no se pudo hablar con MySQL (gestor apagado, conexión rechazada,
 * timeout, conexión cortada), y no un error de la lógica del sistema.
 */
export function isDatabaseConnectionError(error: any): boolean {
  if (!error) return false;
  if (error instanceof ConnectionError || error instanceof ConnectionTimedOutError) return true;

  const name = String(error.name || '');
  const code = String(error.original?.code || error.parent?.code || error.code || '');
  return name.startsWith('SequelizeConnection')
    || name === 'SequelizeHostNotFoundError'
    || name === 'SequelizeHostNotReachableError'
    || ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'EPIPE'].includes(code);
}

/** Arma la respuesta de error, siempre con el mismo formato en todo el sistema. */
function sendError(res: Response, statusCode: number, message: string, status: string = 'error') {
  res.status(statusCode).json({ status, success: false, message, data: null });
}

/**
 * Middleware global de errores: es el ÚNICO lugar que responde errores.
 * Los services lanzan errores (AppError con su código HTTP), los controllers los derivan
 * con next(error) y acá se decide qué se responde.
 */
export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  // Si ya se empezó a mandar una respuesta no se puede mandar otra: se lo deja a Express
  if (res.headersSent) {
    return next(error);
  }

  // 1. La base de datos no responde: 503 (Service Unavailable), no es un error de nuestro código
  if (isDatabaseConnectionError(error)) {
    console.error(`⚠️  ${req.method} ${req.originalUrl}: sin conexión con la base de datos`);
    return sendError(res, 503, DB_UNAVAILABLE_MESSAGE, 'db_unavailable');
  }

  // 2. El body no es un JSON válido (lo detecta express.json())
  if (error?.type === 'entity.parse.failed') {
    return sendError(res, 400, 'El cuerpo de la solicitud no es un JSON válido');
  }

  // 3. Error esperado (AppError o los errores de cada módulo): trae su código y su mensaje
  if (error instanceof AppError || Number.isInteger(error?.statusCode)) {
    return sendError(res, error.statusCode, error.message);
  }

  // 4. MySQL rechazó un valor repetido en una columna única (red de seguridad de los índices)
  if (error?.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'Ya existe un registro con esos datos');
  }

  // 5. Sequelize rechazó un dato por las reglas del modelo
  if (error?.name === 'SequelizeValidationError') {
    return sendError(res, 400, error.errors?.[0]?.message || 'Datos inválidos');
  }

  // 6. Error inesperado: el detalle queda en la consola, al usuario no se le muestra
  console.error(`❌ ${req.method} ${req.originalUrl}:`, error);
  return sendError(res, 500, 'Error interno del servidor');
}
