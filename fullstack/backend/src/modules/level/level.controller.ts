import { type Request, type Response, type NextFunction } from 'express';
import { LevelService } from './level.service.js';

const levelService = new LevelService();

export const getAllLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const levels = await levelService.findAll();
        res.status(200).json({ status: 'ok', data: levels });
    } catch (error) {
        next(error);
    }
};
