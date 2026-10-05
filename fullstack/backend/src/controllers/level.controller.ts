import { type Request, type Response } from 'express';
import { getAllLevelsService } from '../services/level.service.js';

export const getAllLevels = async (req: Request, res: Response): Promise<void> => {
  try {
    const levels = await getAllLevelsService();
    res.status(200).json({ status: 'ok', data: levels });
  } catch (error: any) {
    console.error('Error fetching levels:', error);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};
