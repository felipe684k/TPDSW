import type { Request, Response, NextFunction } from 'express';
import { TuitionFeeService } from './tuition_fee.service.js';

const tuitionFeeService = new TuitionFeeService();

export const getTuitionFees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fees = await tuitionFeeService.findAll();
    res.json(fees);
  } catch (error) {
    next(error);
  }
};

export const createTuitionFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_course, monthly_cost, start_date } = req.body;
    const newFee = await tuitionFeeService.create({
      id_course,
      monthly_cost,
      start_date
    });
    res.status(201).json(newFee);
  } catch (error) {
    next(error);
  }
};
