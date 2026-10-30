import { type Request, type Response } from 'express';
import { ClassroomService } from './classroom.service.js';

const classroomService = new ClassroomService();

export const getClassrooms = async (req: Request, res: Response) => {
    try {
        const classrooms = await classroomService.findAll();
        res.json({ success: true, data: classrooms });
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las aulas' });
    }
};

export const createClassroom = async (req: Request, res: Response) => {
    try {
        const { name, capacity } = req.body;
        const newClassroom = await classroomService.create({ name, capacity });
        res.status(201).json({ success: true, data: newClassroom });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ success: false, message: 'Error al registrar el aula' });
    }
};

export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, capacity } = req.body;

        const classroom = await classroomService.update(Number(id), { name, capacity });
        if (!classroom) {
            res.status(404).json({ success: false, message: 'Aula no encontrada' });
            return;
        }

        res.json({ success: true, data: classroom });
    } catch (error) {
        console.error('Error updating classroom:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el aula' });
    }
};
