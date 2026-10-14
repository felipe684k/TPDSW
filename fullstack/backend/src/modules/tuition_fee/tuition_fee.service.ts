import { TuitionFee, Course } from '../../models/index.js';

export class TuitionFeeService {
  async findAll() {
    return await TuitionFee.findAll({
      include: [{
        model: Course,
        as: 'course',
        attributes: ['course_name'],
        where: { active: true }
      }],
      order: [['start_date', 'DESC']]
    });
  }

  async create(data: { id_course: number; monthly_cost: number; start_date: string | Date }) {
    return await TuitionFee.create(data);
  }
}
