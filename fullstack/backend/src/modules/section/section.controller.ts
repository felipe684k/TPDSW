import type { Request, Response, NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { SectionService } from './section.service.js';

const sectionService = new SectionService();

export const getSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_academic_year, level, id_course } = req.query;
    const sections = await sectionService.findAll({ id_academic_year, level, id_course });
    res.json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

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

export const deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await sectionService.delete(Number(id));
    res.json({ success: true, message: 'Comisión eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
