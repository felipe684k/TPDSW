import type { Request, Response, NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
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
    res.status(200).json({ status: 'ok', message: 'Lista obtenida exitosamente', data: cleanUsers });
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
      res.status(200).json({ status: 'ok', data: student });
      return;
    }

    res.status(200).json({ status: 'not_found', data: null });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login → valida usuario y contraseña y devuelve los datos del usuario (sin la contraseña)
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const userData = await userService.login(username, password);

    res.status(200).json({
      status: 'ok',
      message: 'Inicio de sesión exitoso',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id → detalle de un alumno
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const foundUser = await userService.findById(id);
    res.status(200).json({ status: 'ok', message: 'Alumno encontrado exitosamente', data: foundUser });
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
      res.status(200).json({ status: 'ok', message: 'Alumno reactivado exitosamente', data: result.user });
      return;
    }

    res.status(201).json({ status: 'ok', message: 'Alumno registrado exitosamente', data: result.user });
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

    res.status(200).json({
      status: 'ok',
      message: 'Alumno actualizado exitosamente',
      data: updatedData
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id → baja lógica del alumno y de sus inscripciones
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await userService.delete(id);
    res.status(200).json({ status: 'ok', message: 'Alumno desactivado exitosamente', data: null });
  } catch (error) {
    next(error);
  }
};
