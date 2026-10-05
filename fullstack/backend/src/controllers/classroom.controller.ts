import { type Request, type Response } from 'express';
import * as classroomService from '../services/classroom.service.js';

export const getClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await classroomService.getAllClassrooms();
    res.json({ success: true, data: classrooms });
  } catch (error: any) {
    console.error('Error fetching classrooms:', error);
    const status = error.status || 500;
    const message = error.message || 'Error fetching classrooms';
    res.status(status).json({ success: false, message });
  }
};

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;
    const newClassroom = await classroomService.createNewClassroom(name, capacity);
    res.status(201).json({ success: true, data: newClassroom });
  } catch (error: any) {
    console.error('Error creating classroom:', error);
    const status = error.status || 500;
    const message = error.message || 'Error creating classroom';
    res.status(status).json({ success: false, message });
  }
};

export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, capacity } = req.body;
    
    const classroom = await classroomService.updateExistingClassroom(Number(id), name, capacity);
    res.json({ success: true, data: classroom });
  } catch (error: any) {
    console.error('Error updating classroom:', error);
    const status = error.status || 500;
    const message = error.message || 'Error updating classroom';
    res.status(status).json({ success: false, message });
  }
};
