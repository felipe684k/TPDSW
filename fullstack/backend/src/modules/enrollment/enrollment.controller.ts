import { type Request, type Response } from 'express';
import { EnrollmentService } from './enrollment.service.js';

const enrollmentService = new EnrollmentService();

export const getAllEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await enrollmentService.findAll();
    res.status(200).json({ status: 'ok', data: enrollments });
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section } = req.body;

    if (!id_user || !id_section) {
      res.status(400).json({ status: 'error', message: 'Missing required fields' });
      return;
    }

    const newEnrollment = await enrollmentService.create({
      enrollment_date,
      final_grade,
      attendance_percentage,
      id_user,
      id_section
    });

    res.status(201).json({ status: 'ok', message: 'Enrollment created successfully', data: newEnrollment });
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error' });
  }
};

export const updateEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section, status } = req.body;

    const existingEnrollment = await enrollmentService.update(id, {
      enrollment_date,
      final_grade,
      attendance_percentage,
      id_user,
      id_section,
      status
    });
    if (!existingEnrollment) {
      res.status(404).json({ status: 'error', message: 'Enrollment not found' });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Enrollment updated successfully' });
  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error' });
  }
};

export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingEnrollment = await enrollmentService.delete(id);
    if (!existingEnrollment) {
      res.status(404).json({ status: 'error', message: 'Enrollment not found' });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Enrollment deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating enrollment:', error);
    res.status(500).json({ status: 'db_error', message: 'Internal error' });
  }
};
