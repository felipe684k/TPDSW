import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { AcademicYear, Section } from '../../models/index.js';

/**
 * SERVICE DE CICLOS LECTIVOS
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un error con su código HTTP.
 *
 * Valida que el nombre no se repita y que la fecha de fin sea posterior a la de inicio.
 * Se elimina de verdad (borrado físico), pero solo si no tiene comisiones.
 */

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class AcademicYearError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'AcademicYearError';
  }
}

export class AcademicYearService {
  // El nombre es obligatorio y no se puede repetir (excludeId: al editar, se excluye el propio ciclo)
  private async assertNameAvailable(name: any, excludeId?: number) {
    const cleanName = String(name ?? '').trim();
    if (!cleanName) {
      throw new AcademicYearError('El nombre del ciclo lectivo es obligatorio', 400);
    }
    const where: any = { name: cleanName };
    if (excludeId !== undefined) where.id_academic_year = { [Op.ne]: excludeId };

    const duplicate = await AcademicYear.findOne({ where });
    if (duplicate) {
      throw new AcademicYearError(`Ya existe un ciclo lectivo con el nombre "${cleanName}"`, 409);
    }
    return cleanName;
  }

  // La fecha de fin tiene que ser posterior a la de inicio (se comparan como texto AAAA-MM-DD)
  private assertValidDates(startDate: any, endDate: any) {
    const start = String(startDate ?? '').slice(0, 10);
    const end = String(endDate ?? '').slice(0, 10);
    if (!start || !end || end <= start) {
      throw new AcademicYearError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }
  }

  // ─── CRUD ───

  // Ciclos lectivos, del más nuevo al más viejo
  async findAll() {
    return await AcademicYear.findAll({
      order: [['start_date', 'DESC']]
    });
  }

  // Un ciclo lectivo por su id (null si no existe)
  async findById(id: number) {
    return await AcademicYear.findByPk(id);
  }

  // Crea un ciclo lectivo validando fechas y nombre
  async create(data: { name: string; start_date: string | Date; end_date: string | Date }) {
    this.assertValidDates(data.start_date, data.end_date);
    const name = await this.assertNameAvailable(data.name);
    return await AcademicYear.create({ ...data, name });
  }

  // Edita un ciclo: las fechas se validan combinando las nuevas con las que ya tenía
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

  // Elimina un ciclo lectivo si no tiene comisiones
  async delete(id: number) {
    const academicYear = await AcademicYear.findByPk(id);
    if (!academicYear) {
      return null;
    }
    // No se puede eliminar un ciclo que tiene comisiones
    const sectionsCount = await Section.count({ where: { id_academic_year: id } });
    if (sectionsCount > 0) {
      throw new AcademicYearError('No se puede eliminar el ciclo lectivo porque tiene comisiones asociadas', 409);
    }
    await academicYear.destroy();
    return true;
  }
}
