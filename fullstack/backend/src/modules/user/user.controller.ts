import type { Request, Response, NextFunction } from 'express';
import { isDatabaseConnectionError } from '../../middlewares/errorHandler.js';
import { UserService, UserError } from './user.service.js';

const userService = new UserService();

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, level } = req.query;
    const cleanUsers = await userService.findAll({ search, level });
    res.status(200).json({ status: 'ok', message: 'Lista obtenida exitosamente', data: cleanUsers });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    console.error('Error querying users:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno del servidor', data: [] });
  }
};

export const checkStudentDni = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dni } = req.params;
    if (!dni) {
      res.status(400).json({ status: 'error', message: 'DNI es obligatorio', data: null });
      return;
    }

    const student = await userService.checkStudentDni(dni as string);
    if (student) {
      res.status(200).json({ status: 'ok', data: student });
      return;
    }

    res.status(200).json({ status: 'not_found', data: null });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    console.error('Error checking student DNI:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno del servidor', data: null });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const userData = await userService.login(username, password);

    res.status(200).json({
      status: 'ok',
      message: 'Inicio de sesión exitoso',
      data: userData
    });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof UserError || error?.statusCode) {
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message,
        data: null
      });
      return;
    }
    console.error('Error logging in:', error?.message || error);
    res.status(500).json({
      status: 'db_error',
      message: 'Error interno al iniciar sesión',
      data: null
    });
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const foundUser = await userService.findById(id as string);
    res.status(200).json({ status: 'ok', message: 'Alumno encontrado exitosamente', data: foundUser });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof UserError || error?.statusCode) {
      res.status(error.statusCode || 404).json({ status: 'error', message: error.message, data: null });
      return;
    }
    console.error('Error finding student with ID ' + req.params.id + ':', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al buscar el alumno', data: null });
  }
};

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
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof UserError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ status: 'error', message: error.message, data: null });
      return;
    }
    console.error('Error creating student:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno del servidor', data: null });
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { dni, first_name, last_name, phone, birth_date, email, username, password, level_code } = req.body;

    const updatedData = await userService.update(id as string, {
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
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof UserError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ status: 'error', message: error.message, data: null });
      return;
    }
    console.error('Error updating student:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno del servidor', data: null });
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.delete(id as string);
    res.status(200).json({ status: 'ok', message: 'Alumno desactivado exitosamente', data: null });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof UserError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ status: 'error', message: error.message, data: null });
      return;
    }
    console.error('Error deactivating student:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno del servidor', data: null });
  }
};
