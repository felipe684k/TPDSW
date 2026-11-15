import type { Request, Response, NextFunction } from 'express';
import { parseId } from '../../errors/AppError.js';
import { sendSuccess } from '../../utils/response.js';
import { SectionService } from './section.service.js';

/**
 * CONTROLLER DE COMISIONES  (/api/sections)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const sectionService = new SectionService();

// GET /api/sections?level=&id_course=&id_academic_year= → lista comisiones con filtros opcionales
export const getSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_academic_year, level, id_course } = req.query;
    const sections = await sectionService.findAll({ id_academic_year, level, id_course });
    sendSuccess(res, sections, 'Comisiones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /api/sections/:id → detalle de una comisión
export const getSectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const section = await sectionService.findById(id);
    sendSuccess(res, section, 'Comisión obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

// POST /api/sections → crea una comisión (valida superposición de aula y docente)
export const createSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, id_course, id_classroom, id_academic_year, schedules, id_professor } = req.body;
    const newSection = await sectionService.create({
      name,
      id_course,
      id_classroom,
      id_academic_year,
      schedules,
      id_professor
    });
    sendSuccess(res, newSection, 'Comisión creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/sections/:id → edita una comisión (mismas validaciones que al crear)
export const updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { name, id_course, id_classroom, id_academic_year, schedules, id_professor } = req.body;
    const updatedSection = await sectionService.update(id, {
      name,
      id_course,
      id_classroom,
      id_academic_year,
      schedules,
      id_professor
    });
    sendSuccess(res, updatedSection, 'Comisión actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/sections/:id → elimina una comisión (si no tiene alumnos inscriptos)
export const deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await sectionService.delete(id);
    sendSuccess(res, null, 'Comisión eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};
