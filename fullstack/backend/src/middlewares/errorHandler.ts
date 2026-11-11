import type { Request, Response, NextFunction } from 'express';
import { ConnectionError, ConnectionTimedOutError } from 'sequelize';

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

/**
 * Middleware global de errores. Express lo ejecuta cuando un controller llama a next(error).
 * Si la base de datos no está disponible responde 503 (Service Unavailable): no es un error
 * del sistema (500) sino un servicio externo que no responde.
 */
export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  if (isDatabaseConnectionError(error)) {
    console.error(`⚠️  ${req.method} ${req.originalUrl}: sin conexión con la base de datos`);
    res.status(503).json({ status: 'db_unavailable', message: DB_UNAVAILABLE_MESSAGE, data: null });
    return;
  }

  console.error(`❌ ${req.method} ${req.originalUrl}:`, error);
  res.status(error?.statusCode || 500).json({
    status: 'error',
    message: error?.statusCode ? error.message : 'Error interno del servidor',
    data: null,
  });
}
