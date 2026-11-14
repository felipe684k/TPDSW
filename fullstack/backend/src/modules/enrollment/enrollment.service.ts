import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Enrollment, User, Section, Course, Level, UserLevel, Classroom, AcademicYear, CURRENT_LEVEL_ORDER } from '../../models/index.js';
import { todayLocalDate } from '../../utils/date.js';

/**
 * SERVICE DE INSCRIPCIONES
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un EnrollmentError con su código.
 *
 * CASO DE USO 2: inscribir un alumno a una comisión, validando el nivel que le corresponde
 *                (correlatividad) y que haya cupo en el aula.
 * CASO DE USO 3: evaluar la cursada (nota y asistencia) y, si aprueba con 7 o más,
 *                promoverlo automáticamente al nivel del curso.
 * Los dos casos están relacionados: el nivel que agrega el CUU 3 es el que usa el CUU 2
 * para decidir a qué curso se puede inscribir el alumno después.
 */

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class EnrollmentError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'EnrollmentError';
  }
}

export class EnrollmentService {
  // ─── CONSULTAS ───

  // Listado de inscripciones (filtro opcional por comisión). Incluye al alumno con su historial
  // de niveles y cursadas (para el detalle) y la comisión con su curso y ciclo lectivo.
  async findAll(filters: { id_section?: any } = {}) {
    const where: any = {};

    if (filters.id_section !== undefined && filters.id_section !== '' && filters.id_section !== 'all') {
      const sectionId = Number(filters.id_section);
      if (!Number.isInteger(sectionId) || sectionId <= 0) {
        throw new EnrollmentError('La comisión indicada para filtrar no es válida', 400);
      }
      where.id_section = sectionId;
    }

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          include: [
            { model: Level, as: 'levels' },
            {
              model: Enrollment,
              as: 'enrollments',
              include: [
                {
                  model: Section,
                  as: 'section',
                  include: [
                    {
                      model: Course,
                      as: 'course',
                      include: [{ model: Level, as: 'level' }]
                    },
                    { model: AcademicYear, as: 'academic_year' }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Course,
              as: 'course',
              include: [{ model: Level, as: 'level' }]
            },
            { model: AcademicYear, as: 'academic_year' }
          ]
        }
      ]
    });

    // A cada alumno se le agrega current_level: su nivel actual, que es el más reciente del
    // historial (y si hay dos de la misma fecha, el más avanzado)
    return enrollments.map((e: any) => {
      const plain = typeof e.toJSON === 'function' ? e.toJSON() : e;
      if (plain.user && Array.isArray(plain.user.levels) && plain.user.levels.length > 0) {
        const sortedLevels = [...plain.user.levels].sort((a: any, b: any) => {
          const dateA = a.UserLevel?.start_date ? new Date(a.UserLevel.start_date).getTime() : 0;
          const dateB = b.UserLevel?.start_date ? new Date(b.UserLevel.start_date).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          return Number(b.level_code) - Number(a.level_code);
        });
        plain.user.current_level = sortedLevels[0];
      } else if (plain.user) {
        plain.user.current_level = null;
      }
      return plain;
    });
  }

  // ─── CASO DE USO 2: INSCRIBIR ALUMNO ───

  /**
   * Correlatividad de niveles: calcula a qué nivel puede inscribirse el alumno.
   *   - Sin niveles aprobados → al primero (A1).
   *   - Con nivel X aprobado → solo al siguiente de X (next_level_code).
   *   - Con el último nivel (C2) → a ninguno (allowedLevel = null).
   * Devuelve también el nivel actual, para armar el mensaje de error.
   */
  async getAllowedLevelForStudent(id_user: number) {
    const allLevels: any[] = await Level.findAll();
    if (allLevels.length === 0) return { currentLevel: null, allowedLevel: null };

    // Se trae al alumno con sus niveles ordenados: el primero de la lista es el nivel actual
    const userWithLevels: any = await User.findByPk(id_user, {
      include: [{ model: Level, as: 'levels' }],
      order: CURRENT_LEVEL_ORDER
    });

    const currentLevel = userWithLevels?.levels?.length > 0 ? userWithLevels.levels[0] : null;

    if (!currentLevel) {
      // Sin nivel previo -> le corresponde el primer nivel (el que no es next_level_code de ningún otro)
      const referencedNextCodes = new Set(allLevels.map(l => l.next_level_code).filter(Boolean));
      const initialLevel = allLevels.find(l => !referencedNextCodes.has(l.level_code)) || allLevels[0];
      return { currentLevel: null, allowedLevel: initialLevel };
    }

    // Tiene nivel X -> le corresponde únicamente X.next_level_code
    if (!currentLevel.next_level_code) {
      return { currentLevel, allowedLevel: null };
    }

    const nextLevel = allLevels.find(l => l.level_code === currentLevel.next_level_code) || null;
    return { currentLevel, allowedLevel: nextLevel };
  }

  /**
   * Inscribe un alumno a una comisión. Validaciones, en orden:
   *   1. La comisión y su curso existen (404).
   *   2. El alumno no está ya inscripto en esa comisión (409).
   *   3. Hay cupo: los inscriptos activos no llegan a la capacidad del aula (409).
   *   4. El nivel del curso es el que le corresponde al alumno (correlatividad, 400).
   * La inscripción se crea con estado "Activo". La matrícula queda como deuda en su estado de cuenta.
   */
  async create(data: {
    enrollment_date: any;
    final_grade: any;
    attendance_percentage: any;
    id_user: any;
    id_section: any;
  }) {
    const section: any = await Section.findByPk(data.id_section, {
      include: [
        { model: Course, as: 'course', include: [{ model: Level, as: 'level' }] },
        { model: Classroom, as: 'classroom' }
      ]
    });

    if (!section || !section.course) {
      throw new EnrollmentError('La comisión o el curso seleccionado no existe.', 404);
    }

    // Un alumno no puede inscribirse dos veces en la misma comisión (salvo que se haya dado de baja)
    const alreadyEnrolled = await Enrollment.findOne({
      where: {
        id_user: data.id_user,
        id_section: data.id_section,
        status: { [Op.ne]: 'Dado de Baja' }
      }
    });
    if (alreadyEnrolled) {
      throw new EnrollmentError('El alumno ya está inscripto en esta comisión.', 409);
    }

    // Cupo: no puede haber más inscriptos vigentes que la capacidad del aula
    const capacity = Number(section.classroom?.capacity);
    if (capacity > 0) {
      const enrolledCount = await Enrollment.count({
        where: { id_section: data.id_section, status: { [Op.ne]: 'Dado de Baja' } }
      });
      if (enrolledCount >= capacity) {
        throw new EnrollmentError(`La comisión no tiene cupo disponible: el aula "${section.classroom.name}" tiene capacidad para ${capacity} alumnos.`, 409);
      }
    }

    // Correlatividad: el curso tiene que ser del nivel que le corresponde al alumno
    const { currentLevel, allowedLevel } = await this.getAllowedLevelForStudent(Number(data.id_user));

    if (!allowedLevel) {
      throw new EnrollmentError(
        `El alumno ya posee el nivel máximo (${currentLevel?.name || 'C2'}) y no tiene un nivel siguiente para cursar.`
      );
    }

    if (Number(section.course.level_code) !== Number(allowedLevel.level_code)) {
      const currentDesc = currentLevel ? `tiene aprobado ${currentLevel.name}` : 'no tiene nivel previo';
      throw new EnrollmentError(
        `El alumno ${currentDesc}, por lo que solo puede inscribirse a cursos de nivel "${allowedLevel.name}" (el curso "${section.course.course_name}" es de nivel "${section.course.level?.name || section.course.level_code}").`
      );
    }

    const newEnrollment: any = await Enrollment.create({
      enrollment_date: data.enrollment_date || new Date(),
      final_grade: data.final_grade,
      attendance_percentage: data.attendance_percentage,
      id_user: data.id_user,
      id_section: data.id_section,
      status: 'Activo'
    });

    return newEnrollment;
  }

  // ─── CASO DE USO 3: EVALUAR CURSADA Y PROMOVER DE NIVEL ───

  /**
   * Guarda nota, asistencia y estado de la inscripción.
   * Si la nota final es 7 o más, agrega el nivel del curso al historial del alumno: así,
   * en su próxima inscripción (CUU 2) ya le corresponde el nivel siguiente.
   */
  async update(id: any, data: {
    enrollment_date: any;
    final_grade: any;
    attendance_percentage: any;
    id_user: any;
    id_section: any;
    status: any;
  }) {
    const existingEnrollment: any = await Enrollment.findOne({
      where: { id_enrollment: id },
      include: [
        {
          model: Section,
          as: 'section',
          include: [{ model: Course, as: 'course' }]
        }
      ]
    });
    if (!existingEnrollment) {
      return null;
    }

    // Nota (0 a 10) y asistencia (0 a 100): vacías se permiten, fuera de rango no
    const isOutOfRange = (value: any, max: number) =>
      value !== undefined && value !== null && value !== '' &&
      (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max);
    if (isOutOfRange(data.final_grade, 10)) {
      throw new EnrollmentError('La nota final debe ser un número entre 0 y 10', 400);
    }
    if (isOutOfRange(data.attendance_percentage, 100)) {
      throw new EnrollmentError('El porcentaje de asistencia debe ser un número entre 0 y 100', 400);
    }

    // Nota como número (null si vino vacía) y nivel del curso que se está evaluando
    const grade = data.final_grade !== undefined && data.final_grade !== null && data.final_grade !== ''
      ? Number(data.final_grade)
      : null;
    const courseLevelCode = existingEnrollment.section?.course?.level_code;

    // Nota y subida de nivel se guardan juntas: si falla una, no se guarda ninguna
    const t = await sequelize.transaction();
    try {
      await Enrollment.update({
        enrollment_date: data.enrollment_date,
        final_grade: data.final_grade,
        attendance_percentage: data.attendance_percentage,
        id_user: data.id_user,
        id_section: data.id_section,
        status: data.status,
      }, { where: { id_enrollment: id }, transaction: t });

      // Se agrega el nivel aprobado al historial del alumno sin borrar los anteriores.
      // Si ya lo tenía (por ejemplo, se volvió a cargar la nota), se deja la fecha original.
      if (grade !== null && !isNaN(grade) && grade >= 7 && courseLevelCode) {
        await UserLevel.findOrCreate({
          where: { id_user: existingEnrollment.id_user, level_code: Number(courseLevelCode) },
          defaults: { start_date: todayLocalDate() },
          transaction: t
        });
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    return existingEnrollment;
  }

  // ─── BAJA ───

  // Baja de la inscripción: no se borra, se cambia el estado a "Dado de Baja" (se conservan sus pagos)
  async delete(id: any) {
    const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } });
    if (!existingEnrollment) {
      return null;
    }

    await Enrollment.update(
      { status: 'Dado de Baja' },
      { where: { id_enrollment: id } }
    );

    return existingEnrollment;
  }
}
