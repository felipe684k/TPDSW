import { AcademicYear } from '../../models/index.js';

export class AcademicYearService {
  async findAll() {
    return await AcademicYear.findAll({
      order: [['start_date', 'DESC']]
    });
  }

  async findById(id: number) {
    return await AcademicYear.findByPk(id);
  }

  async create(data: { name: string; start_date: string | Date; end_date: string | Date }) {
    return await AcademicYear.create(data);
  }

  async update(id: number, data: { name?: string; start_date?: string | Date; end_date?: string | Date }) {
    const academicYear = await AcademicYear.findByPk(id);
    if (!academicYear) {
      return null;
    }
    return await academicYear.update(data);
  }

  async delete(id: number) {
    const academicYear = await AcademicYear.findByPk(id);
    if (!academicYear) {
      return null;
    }
    await academicYear.destroy();
    return true;
  }
}
