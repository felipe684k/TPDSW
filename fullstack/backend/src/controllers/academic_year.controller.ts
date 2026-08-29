import type { Request, Response } from 'express';
import { AcademicYear } from '../models/index.js';

export const getAcademicYears = async (req: Request, res: Response) => {
  try {
    const academicYears = await AcademicYear.findAll({
      order: [['start_date', 'DESC']]
    });
    res.json({ success: true, data: academicYears });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({ success: false, message: 'Error fetching academic years' });
  }
};

export const getAcademicYearById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const academicYear = await AcademicYear.findByPk(Number(id));
    if (!academicYear) {
      res.status(404).json({ success: false, message: 'Academic year not found' });
      return;
    }
    res.json({ success: true, data: academicYear });
  } catch (error) {
    console.error('Error fetching academic year:', error);
    res.status(500).json({ success: false, message: 'Error fetching academic year' });
  }
};

export const createAcademicYear = async (req: Request, res: Response) => {
  try {
    const { name, start_date, end_date } = req.body;
    const newAcademicYear = await AcademicYear.create({ name, start_date, end_date });
    res.status(201).json({ success: true, data: newAcademicYear });
  } catch (error) {
    console.error('Error creating academic year:', error);
    res.status(500).json({ success: false, message: 'Error creating academic year' });
  }
};

export const updateAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date } = req.body;
    
    const academicYear = await AcademicYear.findByPk(Number(id));
    if (!academicYear) {
      res.status(404).json({ success: false, message: 'Academic year not found' });
      return;
    }

    await academicYear.update({ name, start_date, end_date });
    res.json({ success: true, data: academicYear });
  } catch (error) {
    console.error('Error updating academic year:', error);
    res.status(500).json({ success: false, message: 'Error updating academic year' });
  }
};

export const deleteAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const academicYear = await AcademicYear.findByPk(Number(id));
    if (!academicYear) {
      res.status(404).json({ success: false, message: 'Academic year not found' });
      return;
    }
    await academicYear.destroy();
    res.json({ success: true, message: 'Academic year deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    res.status(500).json({ success: false, message: 'Error deleting academic year' });
  }
};
