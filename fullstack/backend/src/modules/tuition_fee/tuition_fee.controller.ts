import type { Request, Response } from 'express';
import { TuitionFeeService } from './tuition_fee.service.js';

const tuitionFeeService = new TuitionFeeService();

export const getTuitionFees = async (req: Request, res: Response) => {
  try {
    const fees = await tuitionFeeService.findAll();
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las cuotas' });
  }
};

export const createTuitionFee = async (req: Request, res: Response) => {
  try {
    const { id_course, monthly_cost, start_date } = req.body;
    const newFee = await tuitionFeeService.create({
      id_course,
      monthly_cost,
      start_date
    });
    res.status(201).json(newFee);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la cuota' });
  }
};
