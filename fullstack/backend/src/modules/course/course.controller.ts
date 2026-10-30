import { type Request, type Response } from 'express';
import { CourseService } from './course.service.js';

const courseService = new CourseService();

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await courseService.findAll();
    res.status(200).json({ status: 'ok', data: courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al obtener los cursos', data: [] });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_name, level_code, registration_fee, initial_tuition_fee } = req.body;
    
    if (!course_name || !level_code || !initial_tuition_fee) {
      res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
      return;
    }

    const newCourse = await courseService.create({
      course_name,
      level_code,
      registration_fee,
      initial_tuition_fee
    });

    res.status(201).json({ status: 'ok', message: 'Curso registrado exitosamente', data: newCourse });
  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al crear el curso' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { course_name, level_code, registration_fee } = req.body;
    
    const existingCourse = await courseService.update(id, {
      course_name,
      level_code,
      registration_fee
    });
    if (!existingCourse) {
      res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Curso actualizado exitosamente' });
  } catch (error: any) {
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al actualizar el curso' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const existingCourse = await courseService.delete(id);
    if (!existingCourse) {
      res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
      return;
    }
    
    res.status(200).json({ status: 'ok', message: 'Curso desactivado exitosamente' });
  } catch (error: any) {
    console.error('Error deactivating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al desactivar el curso' });
  }
};
