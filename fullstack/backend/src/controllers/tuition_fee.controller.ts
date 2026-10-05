import type { Request, Response } from 'express';
import * as tuitionFeeService from '../services/tuition_fee.service.js';

export const getTuitionFees = async (req: Request, res: Response) => {
  try {
    const fees = await tuitionFeeService.getTuitionFees();
    res.json(fees);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error fetching tuition fees' });
  }
};

export const createTuitionFee = async (req: Request, res: Response) => {
  try {
    const newFee = await tuitionFeeService.createTuitionFee(req.body);
    res.status(201).json(newFee);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error creating tuition fee' });
  }
};
