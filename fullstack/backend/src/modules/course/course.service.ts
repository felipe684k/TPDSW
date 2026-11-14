import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Course, Level, TuitionFee, Section } from '../../models/index.js';

/**
 * SERVICE DE CURSOS
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un error con su código HTTP.
 *
 * Al crear un curso también se crea su primera cuota mensual (en una transacción).
 * La baja es lógica (active = false) y no se permite si el curso tiene comisiones.
 */

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class CourseError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'CourseError';
  }
}

export class CourseService {
  // Evita cursos activos con el mismo nombre (MySQL compara sin distinguir mayúsculas)
  // ─── VALIDACIONES INTERNAS (private: solo se usan dentro de esta clase) ───

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

  // ─── CRUD ───

  // Cursos activos (con su nivel y su historial de cuotas), con filtro opcional por nivel
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

  // Crea el curso validando montos, nivel y nombre, junto con su cuota inicial
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

    // Curso y cuota inicial se guardan juntos: si falla uno, no se guarda ninguno
    const t = await sequelize.transaction();
    try {
      const newCourse: any = await Course.create({
        course_name: courseName,
        level_code: data.level_code,
        registration_fee: registrationFee,
        weekly_hours: weeklyHours ?? null,
        active: true
      }, { transaction: t });

      // Cuota inicial del curso: rige desde hoy
      await TuitionFee.create({
        id_course: newCourse.id_course,
        start_date: new Date(),
        monthly_cost: tuitionFee
      }, { transaction: t });

      await t.commit();
      return newCourse;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Edita el curso; solo se validan y cambian los campos que se enviaron
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

  // Baja lógica del curso
  async delete(id: any) {
    const existingCourse = await Course.findOne({ where: { id_course: id } });
    if (!existingCourse) {
      return null;
    }

    // No se puede dar de baja un curso que tiene comisiones
    const sectionsCount = await Section.count({ where: { id_course: id } });
    if (sectionsCount > 0) {
      throw new CourseError('No se puede desactivar el curso porque tiene comisiones asociadas', 409);
    }

    // Baja lógica: se marca como inactivo en vez de borrar la fila
    await Course.update({ active: false }, { where: { id_course: id } });
    return existingCourse;
  }
}
