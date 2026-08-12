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

export const getUserByDni = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extraemos el DNI que viene en la URL (por ejemplo: /api/users/12345678)
    const { dni } = req.params;
    // 2. Buscamos en la base de datos usando findOne.
    // Usamos where para asegurar que coincida el DNI y que además sea ALUMNO.
    const usuarioEncontrado = await user.findOne({
      where: {
        dni: dni,
        tipo: 'ALUMNO' // Importante para que no traiga profesores o admins por accidente
      }
    });
    // 3. Validamos si la base de datos encontró algo
    if (!usuarioEncontrado) {
      // Retornamos de inmediato con código 404 (Not Found) si no existe
      res.status(404).json({
        status: 'error',
        mensaje: `No se encontró ningún alumno con el DNI: ${dni}`,
        data: null
      });
      return; // El return evita que se siga ejecutando el código de abajo
    }
    // 4. Si llegó hasta acá, es porque lo encontró. Lo devolvemos al frontend.
    res.status(200).json({
      status: 'ok',
      mensaje: 'Alumno encontrado con éxito',
      data: usuarioEncontrado
    });
  } catch (error: any) {
    // 5. Manejo de errores por si se cae la base de datos
    console.error(`Error al buscar el alumno con DNI ${req.params.dni}:`, error?.message || error);
    res.status(500).json({
      status: 'db_error',
      mensaje: 'Error interno del servidor al buscar el alumno',
      data: null
    });
  }
};

