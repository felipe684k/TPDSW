import { type Request, type Response, type NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { EnrollmentService } from './enrollment.service.js';

/**
 * CONTROLLER DE INSCRIPCIONES  (/api/enrollments)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const enrollmentService = new EnrollmentService();

// GET /api/enrollments?id_section= → lista inscripciones, opcionalmente de una comisión
export const getAllEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_section } = req.query;
    const enrollments = await enrollmentService.findAll({ id_section });
    res.status(200).json({ status: 'ok', data: enrollments });
  } catch (error) {
    next(error);
  }
};

// POST /api/enrollments → inscribe un alumno a una comisión (valida nivel y cupo)
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

// PUT /api/enrollments/:id → carga nota, asistencia o estado (con nota >= 7 sube de nivel)
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

// DELETE /api/enrollments/:id → da de baja la inscripción (cambia el estado)
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
