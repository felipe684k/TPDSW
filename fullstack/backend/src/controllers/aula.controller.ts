import { type Request, type Response } from 'express';
import { Aula } from '../models/index.js';

export const getAulas = async (req: Request, res: Response) => {
  try {
    const aulas = await Aula.findAll();
    res.json({ success: true, data: aulas });
  } catch (error) {
    console.error('Error fetching aulas:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener las aulas' });
  }
};

export const createAula = async (req: Request, res: Response) => {
  try {
    const { nombre, capacidad } = req.body;
    const nuevaAula = await Aula.create({ nombre, capacidad });
    res.status(201).json({ success: true, data: nuevaAula });
  } catch (error) {
    console.error('Error creating aula:', error);
    res.status(500).json({ success: false, mensaje: 'Error al crear el aula' });
  }
};

export const updateAula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, capacidad } = req.body;
    
    const aula = await Aula.findByPk(id);
    if (!aula) {
      res.status(404).json({ success: false, mensaje: 'Aula no encontrada' });
      return;
    }

    await aula.update({ nombre, capacidad });
    res.json({ success: true, data: aula });
  } catch (error) {
    console.error('Error updating aula:', error);
    res.status(500).json({ success: false, mensaje: 'Error al actualizar el aula' });
  }
};
