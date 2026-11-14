import { type Request, type Response, type NextFunction } from 'express';
import { AppError, parseId } from '../../errors/AppError.js';
import { ClassroomService } from './classroom.service.js';

/**
 * CONTROLLER DE AULAS  (/api/classrooms)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const classroomService = new ClassroomService();

// GET /api/classrooms → lista todas las aulas
export const getClassrooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classrooms = await classroomService.findAll();
        res.json({ success: true, data: classrooms });
    } catch (error) {
        next(error);
    }
};

// POST /api/classrooms → crea un aula
export const createClassroom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, capacity } = req.body;
        const newClassroom = await classroomService.create({ name, capacity });
        res.status(201).json({ success: true, data: newClassroom });
    } catch (error) {
        next(error);
    }
};

// PUT /api/classrooms/:id → edita un aula
export const updateClassroom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const { name, capacity } = req.body;

        const classroom = await classroomService.update(Number(id), { name, capacity });
        if (!classroom) {
            throw new AppError('Aula no encontrada', 404);
        }

        res.json({ success: true, data: classroom });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/classrooms/:id → elimina un aula (si no tiene comisiones)
export const deleteClassroom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const classroom = await classroomService.delete(Number(id));
        if (!classroom) {
            throw new AppError('Aula no encontrada', 404);
        }

        res.json({ success: true, message: 'Aula eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};
