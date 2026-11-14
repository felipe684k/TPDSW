import type { Request, Response, NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
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
    res.json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

// GET /api/sections/:id → detalle de una comisión
export const getSectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const section = await sectionService.findById(Number(id));
    if (!section) {
      throw new AppError('Comisión no encontrada', 404);
    }
    res.json({ success: true, data: section });
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
    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    next(error);
  }
};

// PUT /api/sections/:id → edita una comisión (mismas validaciones que al crear)
export const updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { name, id_course, id_classroom, id_academic_year, schedules, id_professor } = req.body;
    const updatedSection = await sectionService.update(Number(id), {
      name,
      id_course,
      id_classroom,
      id_academic_year,
      schedules,
      id_professor
    });
    if (!updatedSection) {
      throw new AppError('Comisión no encontrada', 404);
    }
    res.json({ success: true, data: updatedSection });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/sections/:id → elimina una comisión (si no tiene alumnos inscriptos)
export const deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await sectionService.delete(Number(id));
    res.json({ success: true, message: 'Comisión eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
