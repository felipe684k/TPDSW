import type { Request, Response, NextFunction } from 'express';
import { parseId } from '../../errors/AppError.js';
import { sendSuccess } from '../../utils/response.js';
import { AcademicYearService } from './academic_year.service.js';

/**
 * CONTROLLER DE CICLOS LECTIVOS  (/api/academic-years)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const academicYearService = new AcademicYearService();

// GET /api/academic-years → lista todos los ciclos lectivos
export const getAcademicYears = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const academicYears = await academicYearService.findAll();
    sendSuccess(res, academicYears, 'Ciclos lectivos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /api/academic-years/:id → detalle de un ciclo (404 si no existe)
export const getAcademicYearById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const academicYear = await academicYearService.findById(id);
    sendSuccess(res, academicYear, 'Ciclo lectivo obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};

// POST /api/academic-years → crea un ciclo lectivo
export const createAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, start_date, end_date } = req.body;
    const newAcademicYear = await academicYearService.create({ name, start_date, end_date });
    sendSuccess(res, newAcademicYear, 'Ciclo lectivo creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/academic-years/:id → edita un ciclo lectivo
export const updateAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { name, start_date, end_date } = req.body;
    const academicYear = await academicYearService.update(id, { name, start_date, end_date });
    sendSuccess(res, academicYear, 'Ciclo lectivo actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/academic-years/:id → elimina un ciclo (si no tiene comisiones)
export const deleteAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await academicYearService.delete(id);
    sendSuccess(res, null, 'Ciclo lectivo eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};
