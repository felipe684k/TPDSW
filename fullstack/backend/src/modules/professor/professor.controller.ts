import { type Request, type Response, type NextFunction } from 'express';
import { parseId } from '../../errors/AppError.js';
import { sendSuccess } from '../../utils/response.js';
import { ProfessorService } from './professor.service.js';

/**
 * CONTROLLER DE DOCENTES  (/api/professors)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const professorService = new ProfessorService();

// GET /api/professors → lista los docentes
export const getAllProfessors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status } = req.query;
    const professors = await professorService.findAll({ search, status });

    sendSuccess(res, professors, 'Profesores obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /api/professors/check-dni/:dni → busca un docente dado de baja con ese DNI (para reactivarlo)
export const checkProfessorDni = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dni } = req.params;
    const prof = await professorService.checkDni(dni);

    if (prof) {
      sendSuccess(res, prof, 'Profesor encontrado');
      return;
    }

    sendSuccess(res, null, 'No se encontró un profesor inactivo con ese DNI');
  } catch (error) {
    next(error);
  }
};

// POST /api/professors → crea un docente (o reactiva uno dado de baja con el mismo DNI)
export const createProfessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dni, first_name, last_name, phone, email, birth_date } = req.body;
    const result = await professorService.create({
      dni,
      first_name,
      last_name,
      phone,
      email,
      birth_date
    });

    if (result.reactivated) {
      sendSuccess(res, result.data, 'Profesor reactivado exitosamente', 200);
      return;
    }

    sendSuccess(res, result.data, 'Profesor registrado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/professors/:id → edita un docente
export const updateProfessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { dni, first_name, last_name, phone, email, birth_date, active } = req.body;

    const updatedData = await professorService.update(id, {
      dni,
      first_name,
      last_name,
      phone,
      email,
      birth_date,
      active
    });

    sendSuccess(res, updatedData, 'Profesor actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/professors/:id → baja lógica del docente
export const deleteProfessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await professorService.delete(id);
    sendSuccess(res, null, 'Profesor desactivado exitosamente');
  } catch (error) {
    next(error);
  }
};
