import { AppError } from '../../errors/AppError.js';
import { TuitionFee, Course } from '../../models/index.js';
import { todayLocalDate, toArgentinaDateString } from '../../utils/date.js';

/**
 * SERVICE DE ARANCELES (cuotas mensuales)
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un error con su código HTTP.
 *
 * Cada vez que cambia el precio de un curso se agrega un registro nuevo (no se pisa el anterior):
 * así cada mes se cobra con la cuota que regía en ese momento.
 */

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class TuitionFeeError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'TuitionFeeError';
  }
}

export class TuitionFeeService {
  // Historial de cuotas de los cursos activos, de la más nueva a la más vieja (desempatando por id_tuition_fee)
  async findAll() {
    return await TuitionFee.findAll({
      include: [{
        model: Course,
        as: 'course',
        attributes: ['course_name'],
        where: { active: true }
      }],
      order: [
        ['start_date', 'DESC'],
        ['id_tuition_fee', 'DESC']
      ]
    });
  }

  // Carga un nuevo valor de cuota para un curso existente usando fecha local argentina
  async create(data: { id_course: number; monthly_cost: number; start_date?: string | Date }) {
    if (!data.id_course) {
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

    let normalizedStartDate = todayLocalDate();
    if (data.start_date) {
      if (typeof data.start_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.start_date)) {
        normalizedStartDate = data.start_date;
      } else {
        const parsed = new Date(data.start_date);
        if (!isNaN(parsed.getTime())) {
          normalizedStartDate = toArgentinaDateString(parsed);
        }
      }
    }

    return await TuitionFee.create({
      id_course: data.id_course,
      monthly_cost: cost,
      start_date: normalizedStartDate
    });
  }
}
