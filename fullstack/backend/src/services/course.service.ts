import { Course, Level, TuitionFee } from '../models/index.js';

export const getAllCourses = async () => {
  return await Course.findAll({
    where: { active: true },
    include: [
      { model: Level, as: 'level' },
      { model: TuitionFee, as: 'tuition_fees' }
    ]
  });
};

export const createCourse = async (data: any) => {
  const { course_name, level_code, weekly_hours, days_per_week, registration_fee, initial_tuition_fee } = data;
  
  if (!course_name || !level_code || !initial_tuition_fee) {
    throw { status: 400, message: 'Missing required fields' };
  }

  const newCourse: any = await Course.create({
    course_name,
    level_code,
    weekly_hours,
    days_per_week,
    registration_fee,
    active: true
  });

  await TuitionFee.create({
    id_course: newCourse.id_course,
    start_date: new Date(),
    monthly_cost: initial_tuition_fee
  });

  return newCourse;
};

export const updateCourse = async (id: string, data: any) => {
  const existingCourse = await Course.findOne({ where: { id_course: id } });
  if (!existingCourse) {
    throw { status: 404, message: 'Course not found' };
  }

  await Course.update(data, { where: { id_course: id } });
};

export const deleteCourse = async (id: string) => {
  const existingCourse = await Course.findOne({ where: { id_course: id } });
  if (!existingCourse) {
    throw { status: 404, message: 'Course not found' };
  }

  await Course.update({ active: false }, { where: { id_course: id } });
};
