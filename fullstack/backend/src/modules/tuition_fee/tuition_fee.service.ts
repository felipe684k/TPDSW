import { AppError } from '../../errors/AppError.js';
import { TuitionFee, Course } from '../../models/index.js';

export class TuitionFeeError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'TuitionFeeError';
  }
}

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
    if (!data.id_course || !data.start_date) {
      throw new TuitionFeeError('Faltan campos obligatorios', 400);
    }

    const cost = Number(data.monthly_cost);
    if (!Number.isFinite(cost) || cost <= 0) {
      throw new TuitionFeeError('El monto de la cuota debe ser un número mayor a 0', 400);
    }

    const course = await Course.findOne({ where: { id_course: data.id_course, active: true } });
    if (!course) {
      throw new TuitionFeeError('El curso no existe', 404);
    }

    return await TuitionFee.create({ ...data, monthly_cost: cost });
  }
}
