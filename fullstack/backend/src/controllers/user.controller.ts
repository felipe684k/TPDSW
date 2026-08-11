import { type Request, type Response } from 'express';
import { user } from '../models/user.js';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await user.findAll({
      where: {
        tipo: 'ALUMNO'
      }
    });

    res.status(200).json({
      status: 'ok',
      mensaje: 'Lista de usuarios obtenida con éxito',
      data: users
    });
  } catch (error: any) {
    console.error('Error al consultar usuarios en MySQL:', error?.message || error);
    res.status(200).json({
      status: 'db_error',
      mensaje: 'No se pudo conectar a MySQL o la tabla no existe',
      data: []
    });
  }
};