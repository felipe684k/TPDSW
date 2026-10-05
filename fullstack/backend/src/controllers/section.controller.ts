import type { Request, Response } from 'express';
import * as SectionService from '../services/section.service.js';

export const getSections = async (req: Request, res: Response) => {
  try {
    const { id_academic_year } = req.query;
    const sections = await SectionService.getSectionsService(
      id_academic_year ? Number(id_academic_year) : undefined
    );
    res.json({ success: true, data: sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ success: false, message: 'Error fetching sections' });
  }
};

export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const section = await SectionService.getSectionByIdService(Number(id));
    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }
    res.json({ success: true, data: section });
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ success: false, message: 'Error fetching section' });
  }
};

export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const newSection = await SectionService.createSectionService(req.body);
    res.status(201).json({ success: true, data: newSection });
  } catch (error: any) {
    console.error('Error creating section:', error);
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error creating section' });
  }
};

export const updateSection = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ success: false, message: 'Not implemented. Please delete and create a new section.' });
};

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await SectionService.deleteSectionService(Number(id));
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting section:', error);
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Error deleting section' });
  }
};
