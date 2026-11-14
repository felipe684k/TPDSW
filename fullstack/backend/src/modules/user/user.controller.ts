import type { Request, Response, NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { UserService } from './user.service.js';

const userService = new UserService();

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, level } = req.query;
    const cleanUsers = await userService.findAll({ search, level });
    res.status(200).json({ status: 'ok', message: 'Lista obtenida exitosamente', data: cleanUsers });
  } catch (error) {
    next(error);
  }
};

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

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const foundUser = await userService.findById(id);
    res.status(200).json({ status: 'ok', message: 'Alumno encontrado exitosamente', data: foundUser });
  } catch (error) {
    next(error);
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
  } catch (error) {
    next(error);
  }
};

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

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await userService.delete(id);
    res.status(200).json({ status: 'ok', message: 'Alumno desactivado exitosamente', data: null });
  } catch (error) {
    next(error);
  }
};
