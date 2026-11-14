import { type Request, type Response, type NextFunction } from 'express';
import { LevelService } from './level.service.js';

/**
 * CONTROLLER DE NIVELES  (/api/levels)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const levelService = new LevelService();

// GET /api/levels → lista los niveles (A1 a C2)
export const getAllLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const levels = await levelService.findAll();
        res.status(200).json({ status: 'ok', data: levels });
    } catch (error) {
        next(error);
    }
};
