import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { Course, Level, TuitionFee, Section } from '../../models/index.js';

export class CourseError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'CourseError';
  }
}

export class CourseService {
  // Evita cursos activos con el mismo nombre (MySQL compara sin distinguir mayúsculas)
  private async assertNameAvailable(courseName: any, excludeId?: any) {
    const name = String(courseName ?? '').trim();
    if (!name) {
      throw new CourseError('El nombre del curso es obligatorio', 400);
    }
    const where: any = { course_name: name, active: true };
    if (excludeId !== undefined) where.id_course = { [Op.ne]: excludeId };

    const duplicate = await Course.findOne({ where });
    if (duplicate) {
      throw new CourseError(`Ya existe un curso con el nombre "${name}"`, 409);
    }
    return name;
  }

  // Carga horaria semanal: opcional, pero si se envía debe ser un número entre 0,5 y 60
  private parseWeeklyHours(value: any): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const hours = Number(value);
    if (isNaN(hours) || hours < 0.5 || hours > 60) {
      throw new CourseError('La carga horaria semanal debe ser un número entre 0,5 y 60 horas', 400);
    }
    return hours;
  }

  // La matrícula puede ser 0 (curso sin matrícula), pero no negativa
  private parseRegistrationFee(value: any): number {
    const fee = Number(value);
    if (value === null || value === '' || !Number.isFinite(fee) || fee < 0) {
      throw new CourseError('La matrícula debe ser un número mayor o igual a 0', 400);
    }
    return fee;
  }

  // La cuota mensual tiene que ser mayor a 0
  private parseTuitionFee(value: any): number {
    const fee = Number(value);
    if (!Number.isFinite(fee) || fee <= 0) {
      throw new CourseError('La cuota mensual debe ser un número mayor a 0', 400);
    }
    return fee;
  }

  // El nivel tiene que existir en la base
  private async assertLevelExists(levelCode: any) {
    const level = Number.isInteger(Number(levelCode)) ? await Level.findByPk(Number(levelCode)) : null;
    if (!level) {
      throw new CourseError('El nivel seleccionado no existe', 400);
    }
  }

  async findAll(filters: { level?: any } = {}) {
    const where: any = { active: true };
    if (filters.level !== undefined && filters.level !== '' && filters.level !== 'all') {
      const levelCode = Number(filters.level);
      if (!Number.isInteger(levelCode) || levelCode <= 0) {
        throw new CourseError('El nivel indicado para filtrar no es válido', 400);
      }
      where.level_code = levelCode;
    }

    return await Course.findAll({
      where,
      include: [
        { model: Level, as: 'level' },
        { model: TuitionFee, as: 'tuition_fees' }
      ]
    });
  }

  async create(data: {
    course_name: any;
    level_code: any;
    registration_fee: any;
    initial_tuition_fee: any;
    weekly_hours?: any;
  }) {
    const weeklyHours = this.parseWeeklyHours(data.weekly_hours);
    const registrationFee = this.parseRegistrationFee(data.registration_fee);
    const tuitionFee = this.parseTuitionFee(data.initial_tuition_fee);
    await this.assertLevelExists(data.level_code);
    const courseName = await this.assertNameAvailable(data.course_name);

    const newCourse: any = await Course.create({
      course_name: courseName,
      level_code: data.level_code,
      registration_fee: registrationFee,
      weekly_hours: weeklyHours ?? null,
      active: true
    });

    // Create associated tuition fee
    await TuitionFee.create({
      id_course: newCourse.id_course,
      start_date: new Date(),
      monthly_cost: tuitionFee
    });

    return newCourse;
  }

  async update(id: any, data: {
    course_name: any;
    level_code: any;
    registration_fee: any;
    weekly_hours?: any;
  }) {
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      return null;
    }

    const weeklyHours = this.parseWeeklyHours(data.weekly_hours);
    const registrationFee = data.registration_fee !== undefined
      ? this.parseRegistrationFee(data.registration_fee)
      : undefined;
    if (data.level_code !== undefined) {
      await this.assertLevelExists(data.level_code);
    }

    const courseName = data.course_name !== undefined
      ? await this.assertNameAvailable(data.course_name, id)
      : undefined;

    await Course.update({
      course_name: courseName,
      level_code: data.level_code,
      registration_fee: registrationFee,
      weekly_hours: weeklyHours
    }, { where: { id_course: id } });

    return existingCourse;
  }

  async delete(id: any) {
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      return null;
    }

    // Prevent deactivating a course that has associated sections
    const sectionsCount = await Section.count({ where: { id_course: id } });
    if (sectionsCount > 0) {
      throw new CourseError('No se puede desactivar el curso porque tiene comisiones asociadas', 409);
    }

    // Logical delete
    await Course.update({ active: false }, { where: { id_course: id } });
    return existingCourse;
  }
}
