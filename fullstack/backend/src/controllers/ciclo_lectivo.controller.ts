import type { Request, Response } from 'express';
import { CicloLectivo } from '../models/index.js';

export const getCiclos = async (req: Request, res: Response) => {
  try {
    const ciclos = await CicloLectivo.findAll({
      order: [['fecha_desde', 'DESC']]
    });
    res.json({ success: true, data: ciclos });
  } catch (error) {
    console.error('Error fetching ciclos lectivos:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener ciclos lectivos' });
  }
};

export const getCicloById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ciclo = await CicloLectivo.findByPk(id);
    if (!ciclo) {
      res.status(404).json({ success: false, mensaje: 'Ciclo lectivo no encontrado' });
      return;
    }
    res.json({ success: true, data: ciclo });
  } catch (error) {
    console.error('Error fetching ciclo:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener el ciclo lectivo' });
  }
};

export const createCiclo = async (req: Request, res: Response) => {
  try {
    const { nombre, fecha_desde, fecha_hasta } = req.body;
    const nuevoCiclo = await CicloLectivo.create({ nombre, fecha_desde, fecha_hasta });
    res.status(201).json({ success: true, data: nuevoCiclo });
  } catch (error) {
    console.error('Error creating ciclo:', error);
    res.status(500).json({ success: false, mensaje: 'Error al crear el ciclo lectivo' });
  }
};

export const updateCiclo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, fecha_desde, fecha_hasta } = req.body;
    
    const ciclo = await CicloLectivo.findByPk(id);
    if (!ciclo) {
      res.status(404).json({ success: false, mensaje: 'Ciclo lectivo no encontrado' });
      return;
    }

    await ciclo.update({ nombre, fecha_desde, fecha_hasta });
    res.json({ success: true, data: ciclo });
  } catch (error) {
    console.error('Error updating ciclo:', error);
    res.status(500).json({ success: false, mensaje: 'Error al actualizar el ciclo lectivo' });
  }
};

export const deleteCiclo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ciclo = await CicloLectivo.findByPk(id);
    if (!ciclo) {
      res.status(404).json({ success: false, mensaje: 'Ciclo lectivo no encontrado' });
      return;
    }
    await ciclo.destroy();
    res.json({ success: true, mensaje: 'Ciclo lectivo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting ciclo:', error);
    res.status(500).json({ success: false, mensaje: 'Error al eliminar el ciclo lectivo' });
  }
};
