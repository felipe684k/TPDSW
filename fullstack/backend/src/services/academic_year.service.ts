import { AcademicYear } from '../models/index.js';

export const getAcademicYears = async () => {
  return await AcademicYear.findAll({
    order: [['start_date', 'DESC']]
  });
};

export const getAcademicYearById = async (id: number) => {
  const academicYear = await AcademicYear.findByPk(id);
  if (!academicYear) {
    throw { status: 404, message: 'Academic year not found' };
  }
  return academicYear;
};

export const createAcademicYear = async (data: { name: string; start_date: string; end_date: string }) => {
  return await AcademicYear.create(data);
};

export const updateAcademicYear = async (id: number, data: { name?: string; start_date?: string; end_date?: string }) => {
  const academicYear = await AcademicYear.findByPk(id);
  if (!academicYear) {
    throw { status: 404, message: 'Academic year not found' };
  }
  await academicYear.update(data);
  return academicYear;
};

export const deleteAcademicYear = async (id: number) => {
  const academicYear = await AcademicYear.findByPk(id);
  if (!academicYear) {
    throw { status: 404, message: 'Academic year not found' };
  }
  await academicYear.destroy();
};
