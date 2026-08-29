import { type Request, type Response } from 'express';
import { Course, Level, TuitionFee } from '../models/index.js';

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.findAll({
      where: { active: true },
      include: [
        { model: Level, as: 'level' },
        { model: TuitionFee, as: 'tuition_fees' }
      ]
    });
    res.status(200).json({ status: 'ok', data: courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_name, level_code, weekly_hours, days_per_week, registration_fee, initial_tuition_fee } = req.body;
    
    // Basic validation
    if (!course_name || !level_code || !initial_tuition_fee) {
      res.status(400).json({ status: 'error', message: 'Missing required fields' });
      return;
    }

    const newCourse: any = await Course.create({
      course_name,
      level_code,
      weekly_hours,
      days_per_week,
      registration_fee,
      active: true
    });

    // Create associated tuition fee
    await TuitionFee.create({
      id_course: newCourse.id_course,
      start_date: new Date(),
      monthly_cost: initial_tuition_fee
    });

    res.status(201).json({ status: 'ok', message: 'Course created successfully', data: newCourse });
  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { course_name, level_code, weekly_hours, days_per_week, registration_fee } = req.body;
    
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      res.status(404).json({ status: 'error', message: 'Course not found' });
      return;
    }

    await Course.update({
      course_name,
      level_code,
      weekly_hours,
      days_per_week,
      registration_fee
    }, { where: { id_course: id } });

    res.status(200).json({ status: 'ok', message: 'Course updated successfully' });
  } catch (error: any) {
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      res.status(404).json({ status: 'error', message: 'Course not found' });
      return;
    }

    // Logical delete
    await Course.update({ active: false }, { where: { id_course: id } });
    
    res.status(200).json({ status: 'ok', message: 'Course deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating course:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error' });
  }
};
