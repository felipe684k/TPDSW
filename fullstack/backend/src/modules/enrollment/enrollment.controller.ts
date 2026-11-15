import { type Request, type Response, type NextFunction } from 'express';
import { parseId } from '../../errors/AppError.js';
import { sendSuccess } from '../../utils/response.js';
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
    sendSuccess(res, enrollments, 'Inscripciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

// POST /api/enrollments → inscribe un alumno a una comisión (valida nivel y cupo)
export const createEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section } = req.body;
    const newEnrollment = await enrollmentService.create({
      enrollment_date,
      final_grade,
      attendance_percentage,
      id_user,
      id_section
    });

    sendSuccess(res, newEnrollment, 'Inscripción registrada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/enrollments/:id → carga nota, asistencia o estado (con nota >= 7 sube de nivel)
export const updateEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { final_grade, attendance_percentage, status } = req.body;
    const existingEnrollment = await enrollmentService.update(id, {
      final_grade,
      attendance_percentage,
      status
    });

    sendSuccess(res, existingEnrollment, 'Inscripción actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/enrollments/:id → da de baja la inscripción (cambia el estado)
export const deleteEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await enrollmentService.delete(id);
    sendSuccess(res, null, 'Inscripción dada de baja exitosamente');
  } catch (error) {
    next(error);
  }
};
