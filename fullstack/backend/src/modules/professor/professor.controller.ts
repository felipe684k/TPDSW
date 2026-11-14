import { type Request, type Response, type NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
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

    res.status(200).json({ status: 'ok', message: 'Profesores obtenidos exitosamente', data: professors });
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
      res.status(200).json({ status: 'ok', data: prof });
      return;
    }

    res.status(200).json({ status: 'not_found', data: null });
  } catch (error) {
    next(error);
  }
};

// POST /api/professors → crea un docente (o reactiva uno dado de baja con el mismo DNI)
export const createProfessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dni, first_name, last_name, phone, email, birth_date } = req.body;

    if (!dni || !first_name || !last_name) {
      throw new AppError('DNI, Nombre y Apellido son obligatorios', 400);
    }

    const result = await professorService.create({
      dni,
      first_name,
      last_name,
      phone,
      email,
      birth_date
    });

    if (result.conflict) {
      throw new AppError('Ya existe un usuario con el DNI: ' + dni, 409);
    }

    if (result.reactivated) {
      res.status(201).json({ status: 'ok', message: 'Profesor reactivado exitosamente', data: result.data });
      return;
    }

    res.status(201).json({ status: 'ok', message: 'Profesor registrado exitosamente', data: result.data });
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

    if (!updatedData) {
      throw new AppError('No se encontró un profesor con ID ' + id, 404);
    }

    res.status(200).json({ status: 'ok', message: 'Profesor actualizado exitosamente', data: updatedData });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/professors/:id → baja lógica del docente
export const deleteProfessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    const deleted = await professorService.delete(id);

    if (!deleted) {
      throw new AppError('No se encontró un profesor activo con ID ' + id, 404);
    }

    res.status(200).json({ status: 'ok', message: 'Profesor desactivado exitosamente', data: null });
  } catch (error) {
    next(error);
  }
};
