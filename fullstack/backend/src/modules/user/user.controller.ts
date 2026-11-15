import type { Request, Response, NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { sendSuccess } from '../../utils/response.js';
import { UserService } from './user.service.js';

/**
 * CONTROLLER DE USUARIOS / ALUMNOS  (/api/users)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const userService = new UserService();

// GET /api/users?search=&level= → lista alumnos (búsqueda por nombre o DNI y filtro por nivel)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, level } = req.query;
    const cleanUsers = await userService.findAll({ search, level });
    sendSuccess(res, cleanUsers, 'Lista obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /api/users/check-dni/:dni → busca un alumno dado de baja con ese DNI (para reactivarlo)
export const checkStudentDni = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dni } = req.params;
    if (!dni) {
      throw new AppError('DNI es obligatorio', 400);
    }

    const student = await userService.checkStudentDni(dni as string);
    if (student) {
      sendSuccess(res, student, 'Alumno encontrado');
      return;
    }

    sendSuccess(res, null, 'No se encontró un alumno inactivo con ese DNI');
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login → valida usuario y contraseña y devuelve los datos del usuario (sin la contraseña)
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const userData = await userService.login(username, password);

    sendSuccess(res, userData, 'Inicio de sesión exitoso');
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id → detalle de un alumno
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const foundUser = await userService.findById(id);
    sendSuccess(res, foundUser, 'Alumno encontrado exitosamente');
  } catch (error) {
    next(error);
  }
};

// POST /api/users → crea un alumno (o reactiva uno dado de baja con el mismo DNI)
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dni, first_name, last_name, phone, birth_date, email, level_code } = req.body;
    const result = await userService.create({
      dni,
      first_name,
      last_name,
      phone,
      birth_date,
      email,
      level_code
    });

    if (result.reactivated) {
      sendSuccess(res, result.user, 'Alumno reactivado exitosamente', 200);
      return;
    }

    sendSuccess(res, result.user, 'Alumno registrado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id → edita un alumno
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { dni, first_name, last_name, phone, birth_date, email, username, password, level_code } = req.body;

    const updatedData = await userService.update(id, {
      dni,
      first_name,
      last_name,
      phone,
      birth_date,
      email,
      username,
      password,
      level_code
    });

    sendSuccess(res, updatedData, 'Alumno actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id → baja lógica del alumno y de sus inscripciones
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await userService.delete(id);
    sendSuccess(res, null, 'Alumno desactivado exitosamente');
  } catch (error) {
    next(error);
  }
};
