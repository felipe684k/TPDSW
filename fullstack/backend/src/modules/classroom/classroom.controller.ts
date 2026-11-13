import { type Request, type Response, type NextFunction } from 'express';
import { isDatabaseConnectionError } from '../../middlewares/errorHandler.js';
import { ClassroomService, ClassroomError } from './classroom.service.js';

const classroomService = new ClassroomService();

export const getClassrooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classrooms = await classroomService.findAll();
        res.json({ success: true, data: classrooms });
    } catch (error) {
        if (isDatabaseConnectionError(error)) return next(error);
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las aulas' });
    }
};

export const createClassroom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, capacity } = req.body;
        const newClassroom = await classroomService.create({ name, capacity });
        res.status(201).json({ success: true, data: newClassroom });
    } catch (error) {
        if (isDatabaseConnectionError(error)) return next(error);
        if (error instanceof ClassroomError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Error creating classroom:', error);
        res.status(500).json({ success: false, message: 'Error al registrar el aula' });
    }
};

export const updateClassroom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        if (isDatabaseConnectionError(error)) return next(error);
        if (error instanceof ClassroomError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Error updating classroom:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el aula' });
    }
};

export const deleteClassroom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const classroom = await classroomService.delete(Number(id));
        if (!classroom) {
            res.status(404).json({ success: false, message: 'Aula no encontrada' });
            return;
        }

        res.json({ success: true, message: 'Aula eliminada exitosamente' });
    } catch (error) {
        if (isDatabaseConnectionError(error)) return next(error);
        if (error instanceof ClassroomError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        console.error('Error deleting classroom:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el aula' });
    }
};
