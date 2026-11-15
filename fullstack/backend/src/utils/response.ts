import type { Response } from 'express';

/**
 * UTILIDAD DE RESPUESTAS HTTP DE ÉXITO
 *
 * Unifica el contrato de respuesta exitosa en todos los controllers del backend:
 *   { status: 'ok', success: true, message, data }
 *
 * Es simétrico con sendError en middlewares/errorHandler.ts:
 *   { status, success: false, message, data: null }
 */
export function sendSuccess(
  res: Response,
  data: unknown = null,
  message: string = 'OK',
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    status: 'ok',
    success: true,
    message,
    data
  });
}
