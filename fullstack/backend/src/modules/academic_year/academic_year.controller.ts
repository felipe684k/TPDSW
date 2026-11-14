import type { Request, Response, NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { AcademicYearService } from './academic_year.service.js';

const academicYearService = new AcademicYearService();

export const getAcademicYears = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const academicYears = await academicYearService.findAll();
    res.json({ success: true, data: academicYears });
  } catch (error) {
    next(error);
  }
};

export const getAcademicYearById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const academicYear = await academicYearService.findById(Number(id));
    if (!academicYear) {
      throw new AppError('Ciclo lectivo no encontrado', 404);
    }
    res.json({ success: true, data: academicYear });
  } catch (error) {
    next(error);
  }
};

export const createAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, start_date, end_date } = req.body;
    const newAcademicYear = await academicYearService.create({ name, start_date, end_date });
    res.status(201).json({ success: true, data: newAcademicYear });
  } catch (error) {
    next(error);
  }
};

export const updateAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { name, start_date, end_date } = req.body;
    
    const academicYear = await academicYearService.update(Number(id), { name, start_date, end_date });
    if (!academicYear) {
      throw new AppError('Ciclo lectivo no encontrado', 404);
    }

    res.json({ success: true, data: academicYear });
  } catch (error) {
    next(error);
  }
};

export const deleteAcademicYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const deleted = await academicYearService.delete(Number(id));
    if (!deleted) {
      throw new AppError('Ciclo lectivo no encontrado', 404);
    }
    res.json({ success: true, message: 'Ciclo lectivo eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};
