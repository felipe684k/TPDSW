import { Classroom } from '../models/index.js';

export const getAllClassrooms = async () => {
  return await Classroom.findAll();
};

export const createNewClassroom = async (name: string, capacity: number) => {
  return await Classroom.create({ name, capacity });
};

export const updateExistingClassroom = async (id: number, name: string, capacity: number) => {
  const classroom = await Classroom.findByPk(id);
  if (!classroom) {
    throw { status: 404, message: 'Classroom not found' };
  }
  await classroom.update({ name, capacity });
  return classroom;
};
