import { type Request, type Response, type NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { EnrollmentService } from './enrollment.service.js';

const enrollmentService = new EnrollmentService();

export const getAllEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_section } = req.query;
    const enrollments = await enrollmentService.findAll({ id_section });
    res.status(200).json({ status: 'ok', data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section } = req.body;

    if (!id_user || !id_section) {
      throw new AppError('Faltan campos obligatorios', 400);
    }

    const newEnrollment = await enrollmentService.create({
      enrollment_date,
      final_grade,
      attendance_percentage,
      id_user,
      id_section
    });

    res.status(201).json({ status: 'ok', message: 'Inscripción registrada exitosamente', data: newEnrollment });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
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
      throw new AppError('Inscripción no encontrada', 404);
    }

    res.status(200).json({ status: 'ok', message: 'Inscripción actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const deleteEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    const existingEnrollment = await enrollmentService.delete(id);
    if (!existingEnrollment) {
      throw new AppError('Inscripción no encontrada', 404);
    }

    res.status(200).json({ status: 'ok', message: 'Inscripción dada de baja exitosamente' });
  } catch (error) {
    next(error);
  }
};
