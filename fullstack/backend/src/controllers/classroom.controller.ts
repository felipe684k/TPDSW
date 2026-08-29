import { type Request, type Response } from 'express';
import { Classroom } from '../models/index.js';

export const getClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await Classroom.findAll();
    res.json({ success: true, data: classrooms });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ success: false, message: 'Error fetching classrooms' });
  }
};

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;
    const newClassroom = await Classroom.create({ name, capacity });
    res.status(201).json({ success: true, data: newClassroom });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ success: false, message: 'Error creating classroom' });
  }
};

export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, capacity } = req.body;
    
    const classroom = await Classroom.findByPk(Number(id));
    if (!classroom) {
      res.status(404).json({ success: false, message: 'Classroom not found' });
      return;
    }

    await classroom.update({ name, capacity });
    res.json({ success: true, data: classroom });
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ success: false, message: 'Error updating classroom' });
  }
};
