import { Op } from 'sequelize';
import { AcademicYear, Section } from '../../models/index.js';

export class AcademicYearError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AcademicYearError';
    this.statusCode = statusCode;
  }
}

export class AcademicYearService {
  // Prevent duplicate academic year names
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

  // Validate that end_date is after start_date
  private assertValidDates(startDate: any, endDate: any) {
    const start = String(startDate ?? '').slice(0, 10);
    const end = String(endDate ?? '').slice(0, 10);
    if (!start || !end || end <= start) {
      throw new AcademicYearError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }
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
    this.assertValidDates(data.start_date, data.end_date);
    const name = await this.assertNameAvailable(data.name);
    return await AcademicYear.create({ ...data, name });
  }

  async update(id: number, data: { name?: string; start_date?: string | Date; end_date?: string | Date }) {
    const academicYear: any = await AcademicYear.findByPk(id);
    if (!academicYear) {
      return null;
    }
    const start = data.start_date ?? academicYear.start_date;
    const end = data.end_date ?? academicYear.end_date;
    this.assertValidDates(start, end);

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
    // Prevent deleting an academic year that has sections
    const sectionsCount = await Section.count({ where: { id_academic_year: id } });
    if (sectionsCount > 0) {
      throw new AcademicYearError('No se puede eliminar el ciclo lectivo porque tiene comisiones asociadas', 409);
    }
    await academicYear.destroy();
    return true;
  }
}
