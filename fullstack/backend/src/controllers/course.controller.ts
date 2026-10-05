import { type Request, type Response } from 'express';
import * as courseService from '../services/course.service.js';

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json({ status: 'ok', data: courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    if (error.status) {
      res.status(error.status).json({ status: 'error', message: error.message });
    } else {
      res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
    }
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCourse = await courseService.createCourse(req.body);
    res.status(201).json({ status: 'ok', message: 'Course created successfully', data: newCourse });
  } catch (error: any) {
    console.error('Error creating course:', error);
    if (error.status) {
      res.status(error.status).json({ status: 'error', message: error.message });
    } else {
      res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { course_name, level_code, weekly_hours, days_per_week, registration_fee } = req.body;
    
    await courseService.updateCourse(id, {
      course_name,
      level_code,
      weekly_hours,
      days_per_week,
      registration_fee
    });

    res.status(200).json({ status: 'ok', message: 'Course updated successfully' });
  } catch (error: any) {
    console.error('Error updating course:', error);
    if (error.status) {
      res.status(error.status).json({ status: 'error', message: error.message });
    } else {
      res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await courseService.deleteCourse(id);
    
    res.status(200).json({ status: 'ok', message: 'Course deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating course:', error);
    if (error.status) {
      res.status(error.status).json({ status: 'error', message: error.message });
    } else {
      res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
  }
};
