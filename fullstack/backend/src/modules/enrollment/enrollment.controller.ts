import { type Request, type Response } from 'express';
import { EnrollmentService } from './enrollment.service.js';

const enrollmentService = new EnrollmentService();

export const getAllEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await enrollmentService.findAll();
    res.status(200).json({ status: 'ok', data: enrollments });
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al obtener las inscripciones', data: [] });
  }
};

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section } = req.body;

    if (!id_user || !id_section) {
      res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
      return;
    }

    const newEnrollment = await enrollmentService.create({
      enrollment_date,
      final_grade,
      attendance_percentage,
      id_user,
      id_section
    });

    res.status(201).json({ status: 'ok', message: 'Inscripción registrada exitosamente', data: newEnrollment });
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    const msg = error?.message || 'Error interno al registrar la inscripción';
    res.status(400).json({ status: 'error', message: msg });
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
      res.status(404).json({ status: 'error', message: 'Inscripción no encontrada' });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Inscripción actualizada exitosamente' });
  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al actualizar la inscripción' });
  }
};

export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingEnrollment = await enrollmentService.delete(id);
    if (!existingEnrollment) {
      res.status(404).json({ status: 'error', message: 'Inscripción no encontrada' });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Inscripción dada de baja exitosamente' });
  } catch (error: any) {
    console.error('Error deactivating enrollment:', error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al desactivar la inscripción' });
  }
};
