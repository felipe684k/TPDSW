import type { Request, Response } from 'express';
import * as AcademicYearService from '../services/academic_year.service.js';

export const getAcademicYears = async (req: Request, res: Response) => {
  try {
    const academicYears = await AcademicYearService.getAcademicYears();
    res.json({ success: true, data: academicYears });
  } catch (error: any) {
    console.error('Error fetching academic years:', error);
    const status = error.status || 500;
    const message = error.message || 'Error fetching academic years';
    res.status(status).json({ success: false, message });
  }
};

export const getAcademicYearById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const academicYear = await AcademicYearService.getAcademicYearById(Number(id));
    res.json({ success: true, data: academicYear });
  } catch (error: any) {
    console.error('Error fetching academic year:', error);
    const status = error.status || 500;
    const message = error.message || 'Error fetching academic year';
    res.status(status).json({ success: false, message });
  }
};

export const createAcademicYear = async (req: Request, res: Response) => {
  try {
    const { name, start_date, end_date } = req.body;
    const newAcademicYear = await AcademicYearService.createAcademicYear({ name, start_date, end_date });
    res.status(201).json({ success: true, data: newAcademicYear });
  } catch (error: any) {
    console.error('Error creating academic year:', error);
    const status = error.status || 500;
    const message = error.message || 'Error creating academic year';
    res.status(status).json({ success: false, message });
  }
};

export const updateAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date } = req.body;
    const academicYear = await AcademicYearService.updateAcademicYear(Number(id), { name, start_date, end_date });
    res.json({ success: true, data: academicYear });
  } catch (error: any) {
    console.error('Error updating academic year:', error);
    const status = error.status || 500;
    const message = error.message || 'Error updating academic year';
    res.status(status).json({ success: false, message });
  }
};

export const deleteAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await AcademicYearService.deleteAcademicYear(Number(id));
    res.json({ success: true, message: 'Academic year deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting academic year:', error);
    const status = error.status || 500;
    const message = error.message || 'Error deleting academic year';
    res.status(status).json({ success: false, message });
  }
};
