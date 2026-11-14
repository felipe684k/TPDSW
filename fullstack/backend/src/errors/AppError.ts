/**
 * ERRORES DEL SISTEMA
 *
 * AppError es el error "esperado" del sistema: algo que el usuario hizo mal o que no se puede hacer
 * (un dato faltante, algo que no existe, un horario ocupado...).
 * Hereda de Error (la clase de error de JavaScript) y le agrega el código HTTP con el que hay que
 * responder. El que arma la respuesta es el errorHandler (middlewares/errorHandler.ts).
 *
 * Cada módulo tiene su propia clase que hereda de esta (CourseError, SectionError, UserError...),
 * así el nombre del error dice de qué módulo viene.
 *
 * Uso: throw new AppError('Curso no encontrado', 404);
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

/** Convierte el :id de la URL en número; si no es un entero positivo (ej. "abc") responde 400. */
export function parseId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('El ID indicado no es válido', 400);
  return id;
}
