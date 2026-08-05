import { type Request, type Response } from 'express';
import { user } from '../models/user.js';

// Esta es la función que estás llamando desde tus rutas:
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Le pedimos a MySQL que traiga todos los usuarios (a través de Sequelize)
    const users = await user.findAll({
      where: {
        tipo: 'ALUMNO'
      }
    });

    // 2. Si todo sale bien, se los mandamos al frontend en formato JSON
    res.status(200).json({
      mensaje: 'Lista de usuarios obtenida con éxito',
      data: users
    });
  } catch (error) {
    // 3. Si hay un error en la base de datos, avisamos
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor' });
  }
};