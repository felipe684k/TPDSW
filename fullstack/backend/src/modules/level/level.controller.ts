import { type Request, type Response, type NextFunction } from 'express';
import { isDatabaseConnectionError } from '../../middlewares/errorHandler.js';
import { LevelService } from './level.service.js';

const levelService = new LevelService();

export const getAllLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const levels = await levelService.findAll();
        res.status(200).json({ status: 'ok', data: levels });
    } catch (error: any) {
        if (isDatabaseConnectionError(error)) return next(error);
        console.error('Error fetching levels:', error);
        res.status(500).json({ status: 'db_error', message: 'Error interno al obtener los niveles', data: [] });
    }
};
