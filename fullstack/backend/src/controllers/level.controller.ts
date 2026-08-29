import { type Request, type Response } from 'express';
import { Level } from '../models/index.js';

export const getAllLevels = async (req: Request, res: Response): Promise<void> => {
  try {
    const levels = await Level.findAll();
    res.status(200).json({ status: 'ok', data: levels });
  } catch (error: any) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};
