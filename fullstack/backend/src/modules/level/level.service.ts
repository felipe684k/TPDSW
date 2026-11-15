import { AppError } from '../../errors/AppError.js';
import { Level } from '../../models/index.js';

export class LevelError extends AppError {
    constructor(message: string, statusCode: number = 400) {
        super(message, statusCode);
        this.name = 'LevelError';
    }
}

/**
 * SERVICE DE NIVELES
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un error con su código HTTP.
 *
 * Solo lectura: los niveles (A1 a C2) se crean automáticamente al iniciar el backend (ver app.ts).
 */
export class LevelService {
    async findAll() {
        return await Level.findAll();
    }
}