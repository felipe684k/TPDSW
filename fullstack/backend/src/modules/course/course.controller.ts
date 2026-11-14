import { type Request, type Response, type NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { CourseService } from './course.service.js';

const courseService = new CourseService();

export const getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level } = req.query;
    const courses = await courseService.findAll({ level });
    res.status(200).json({ status: 'ok', data: courses });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { course_name, level_code, registration_fee, initial_tuition_fee, weekly_hours } = req.body;
    
    if (!course_name || !level_code || !initial_tuition_fee) {
      throw new AppError('Faltan campos obligatorios', 400);
    }

    const newCourse = await courseService.create({
      course_name,
      level_code,
      registration_fee,
      initial_tuition_fee,
      weekly_hours
    });

    res.status(201).json({ status: 'ok', message: 'Curso registrado exitosamente', data: newCourse });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { course_name, level_code, registration_fee, weekly_hours } = req.body;
    
    const existingCourse = await courseService.update(id, {
      course_name,
      level_code,
      registration_fee,
      weekly_hours
    });
    if (!existingCourse) {
      throw new AppError('Curso no encontrado', 404);
    }

    res.status(200).json({ status: 'ok', message: 'Curso actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    
    const existingCourse = await courseService.delete(id);
    if (!existingCourse) {
      throw new AppError('Curso no encontrado', 404);
    }
    
    res.status(200).json({ status: 'ok', message: 'Curso desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
};
