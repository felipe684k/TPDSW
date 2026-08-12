import { type Request, type Response } from 'express';
import { user } from '../models/user.js';

//export indica que esta funcion se va a poder usar en otros archivos, por ejemplo en Alumnos.tsx
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    //Define la constante usuarios y consulta todos los usuarios de la tabla user usando where para filtrar por tipo 'ALUMNO'
    const users = await user.findAll({
      where: {
        tipo: 'ALUMNO'
      }
    });

    res.status(200).json({
      status: 'ok',
      mensaje: 'Lista de usuarios obtenida con éxito',
      data: users //muestro todos los usuarios
    }); 0

  } catch (error: any) {
    console.error('Error al consultar usuarios en MySQL:', error?.message || error);
    res.status(200).json({
      status: 'db_error',
      mensaje: 'No se pudo conectar a MySQL o la tabla no existe',
      data: [] //en caso de error, muestro un array vacio para que no explote el frontend, y en el front se muestren los datos precargados
    });
  }
};