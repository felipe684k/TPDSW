import { type Request, type Response } from 'express';
import { Nivel } from '../models/index.js';

export const getAllNiveles = async (req: Request, res: Response): Promise<void> => {
  try {
    const niveles = await Nivel.findAll();
    res.status(200).json({ status: 'ok', data: niveles });
  } catch (error: any) {
    console.error('Error al obtener niveles:', error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: [] });
  }
};
