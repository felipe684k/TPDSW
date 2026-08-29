import type { Request, Response } from 'express';
import { TuitionFee, Course } from '../models/index.js';

export const getTuitionFees = async (req: Request, res: Response) => {
  try {
    const fees = await TuitionFee.findAll({
      include: [{
        model: Course,
        as: 'course',
        attributes: ['course_name'],
        where: { active: true }
      }],
      order: [['start_date', 'DESC']]
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tuition fees' });
  }
};

export const createTuitionFee = async (req: Request, res: Response) => {
  try {
    const { id_course, monthly_cost, start_date } = req.body;
    const newFee = await TuitionFee.create({
      id_course,
      monthly_cost,
      start_date
    });
    res.status(201).json(newFee);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tuition fee' });
  }
};
