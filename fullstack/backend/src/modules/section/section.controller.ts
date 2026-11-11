import type { Request, Response, NextFunction } from 'express';
import { isDatabaseConnectionError } from '../../middlewares/errorHandler.js';
import { SectionService, SectionError } from './section.service.js';

const sectionService = new SectionService();

export const getSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_academic_year } = req.query;
    const sections = await sectionService.findAll({ id_academic_year });
    res.json({ success: true, data: sections });
  } catch (error) {
    if (isDatabaseConnectionError(error)) return next(error);
    console.error('Error fetching sections:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las comisiones' });
  }
};

export const getSectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const section = await sectionService.findById(Number(id));
    if (!section) {
      res.status(404).json({ success: false, message: 'Comisión no encontrada' });
      return;
    }
    res.json({ success: true, data: section });
  } catch (error) {
    if (isDatabaseConnectionError(error)) return next(error);
    console.error('Error fetching section:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la comisión' });
  }
};

export const createSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_course, id_classroom, id_academic_year, schedules, id_professor } = req.body;
    const newSection = await sectionService.create({
      id_course,
      id_classroom,
      id_academic_year,
      schedules,
      id_professor
    });
    res.status(201).json({ success: true, data: newSection });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof SectionError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ success: false, message: error.message });
      return;
    }
    console.error('Error creating section:', error);
    res.status(500).json({ success: false, message: 'Error al crear la comisión' });
  }
};

export const updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.status(501).json({ success: false, message: 'No implementado. Por favor eliminá y creá una nueva comisión.' });
};

export const deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await sectionService.delete(Number(id));
    res.json({ success: true, message: 'Comisión eliminada exitosamente' });
  } catch (error: any) {
    if (isDatabaseConnectionError(error)) return next(error);
    if (error instanceof SectionError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ success: false, message: error.message });
      return;
    }
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la comisión' });
  }
};
