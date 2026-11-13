import { type Request, type Response, type NextFunction } from 'express';
import { isDatabaseConnectionError } from '../../middlewares/errorHandler.js';
import { CourseService, CourseError } from './course.service.js';

const courseService = new CourseService();

export const getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level } = req.query;
    const courses = await courseService.findAll({ level });
    res.status(200).json({ status: 'ok', data: courses });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof CourseError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al obtener los cursos', data: [] });
  }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { course_name, level_code, registration_fee, initial_tuition_fee, weekly_hours } = req.body;
    
    if (!course_name || !level_code || !initial_tuition_fee) {
      res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
      return;
    }

    const newCourse = await courseService.create({
      course_name,
      level_code,
      registration_fee,
      initial_tuition_fee,
      weekly_hours
    });

    res.status(201).json({ status: 'ok', message: 'Curso registrado exitosamente', data: newCourse });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof CourseError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Error creating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al crear el curso' });
  }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { course_name, level_code, registration_fee, weekly_hours } = req.body;
    
    const existingCourse = await courseService.update(id, {
      course_name,
      level_code,
      registration_fee,
      weekly_hours
    });
    if (!existingCourse) {
      res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Curso actualizado exitosamente' });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof CourseError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al actualizar el curso' });
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const existingCourse = await courseService.delete(id);
    if (!existingCourse) {
      res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
      return;
    }
    
    res.status(200).json({ status: 'ok', message: 'Curso desactivado exitosamente' });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof CourseError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Error deactivating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al desactivar el curso' });
  }
};
