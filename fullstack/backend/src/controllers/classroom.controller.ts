import { type Request, type Response } from 'express';
import { Classroom } from '../models/index.js';

// TODO: Implementar métodos de la CRUD de Classroom (Aulas)
export const getClassrooms = async (req: Request, res: Response) => {
  // Lógica para obtener aulas
};

export const createClassroom = async (req: Request, res: Response) => {
  // Lógica para crear aula
};

export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
  // Lógica para actualizar aula
};

export const deleteClassroom = async (req: Request, res: Response) => {
  // Lógica para eliminar aula
};

