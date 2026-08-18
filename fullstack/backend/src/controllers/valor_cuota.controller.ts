import type { Request, Response } from 'express';
import { ValorCuota, Curso } from '../models/index.js';

export const getValoresCuota = async (req: Request, res: Response) => {
  try {
    const valores = await ValorCuota.findAll({
      include: [{
        model: Curso,
        as: 'curso',
        attributes: ['nombre_curso'],
        where: { activo: true }
      }],
      order: [['fecha_desde', 'DESC']]
    });
    res.json(valores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los valores de cuota' });
  }
};

export const createValorCuota = async (req: Request, res: Response) => {
  try {
    const { id_curso, costo_mensual, fecha_desde } = req.body;
    const nuevoValor = await ValorCuota.create({
      id_curso,
      costo_mensual,
      fecha_desde
    });
    res.status(201).json(nuevoValor);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el valor de cuota' });
  }
};
