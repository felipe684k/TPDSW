import { Op } from 'sequelize';
import { AcademicYear } from '../../models/index.js';

export class AcademicYearError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AcademicYearError';
    this.statusCode = statusCode;
  }
}

export class AcademicYearService {
  // Evita ciclos lectivos con el mismo nombre (MySQL compara sin distinguir mayúsculas)
  private async assertNameAvailable(name: any, excludeId?: number) {
    const cleanName = String(name ?? '').trim();
    const where: any = { name: cleanName };
    if (excludeId !== undefined) where.id_academic_year = { [Op.ne]: excludeId };

    const duplicate = await AcademicYear.findOne({ where });
    if (duplicate) {
      throw new AcademicYearError(`Ya existe un ciclo lectivo con el nombre "${cleanName}"`, 409);
    }
    return cleanName;
  }

  async findAll() {
    return await AcademicYear.findAll({
      order: [['start_date', 'DESC']]
    });
  }

  async findById(id: number) {
    return await AcademicYear.findByPk(id);
  }

  async create(data: { name: string; start_date: string | Date; end_date: string | Date }) {
    const name = await this.assertNameAvailable(data.name);
    return await AcademicYear.create({ ...data, name });
  }

  async update(id: number, data: { name?: string; start_date?: string | Date; end_date?: string | Date }) {
    const academicYear = await AcademicYear.findByPk(id);
    if (!academicYear) {
      return null;
    }
    if (data.name !== undefined) {
      data = { ...data, name: await this.assertNameAvailable(data.name, id) };
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
