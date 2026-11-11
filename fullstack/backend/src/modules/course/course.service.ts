import { Op } from 'sequelize';
import { Course, Level, TuitionFee } from '../../models/index.js';

export class CourseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CourseError';
    this.statusCode = statusCode;
  }
}

export class CourseService {
  // Evita cursos activos con el mismo nombre (MySQL compara sin distinguir mayúsculas)
  private async assertNameAvailable(courseName: any, excludeId?: any) {
    const name = String(courseName ?? '').trim();
    const where: any = { course_name: name, active: true };
    if (excludeId !== undefined) where.id_course = { [Op.ne]: excludeId };

    const duplicate = await Course.findOne({ where });
    if (duplicate) {
      throw new CourseError(`Ya existe un curso con el nombre "${name}"`, 409);
    }
    return name;
  }

  async findAll() {
    return await Course.findAll({
      where: { active: true },
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
  }) {
    const courseName = await this.assertNameAvailable(data.course_name);

    const newCourse: any = await Course.create({
      course_name: courseName,
      level_code: data.level_code,
      registration_fee: data.registration_fee,
      active: true
    });

    // Create associated tuition fee
    await TuitionFee.create({
      id_course: newCourse.id_course,
      start_date: new Date(),
      monthly_cost: data.initial_tuition_fee
    });

    return newCourse;
  }

  async update(id: any, data: {
    course_name: any;
    level_code: any;
    registration_fee: any;
  }) {
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      return null;
    }

    const courseName = data.course_name !== undefined
      ? await this.assertNameAvailable(data.course_name, id)
      : undefined;

    await Course.update({
      course_name: courseName,
      level_code: data.level_code,
      registration_fee: data.registration_fee
    }, { where: { id_course: id } });

    return existingCourse;
  }

  async delete(id: any) {
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      return null;
    }

    // Logical delete
    await Course.update({ active: false }, { where: { id_course: id } });
    return existingCourse;
  }
}
