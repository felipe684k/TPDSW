import { TuitionFee, Course } from '../models/index.js';

export const getTuitionFees = async () => {
  return await TuitionFee.findAll({
    include: [{
      model: Course,
      as: 'course',
      attributes: ['course_name'],
      where: { active: true }
    }],
    order: [['start_date', 'DESC']]
  });
};

export const createTuitionFee = async (data: any) => {
  return await TuitionFee.create({
    id_course: data.id_course,
    monthly_cost: data.monthly_cost,
    start_date: data.start_date
  });
};
