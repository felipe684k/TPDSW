import { Course, Level, TuitionFee } from '../../models/index.js';

export class CourseService {
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
    const newCourse: any = await Course.create({
      course_name: data.course_name,
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

    await Course.update({
      course_name: data.course_name,
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
