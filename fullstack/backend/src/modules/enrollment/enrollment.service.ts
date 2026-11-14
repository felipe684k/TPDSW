import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { Enrollment, User, Section, Course, Level, UserLevel, Classroom, AcademicYear, CURRENT_LEVEL_ORDER } from '../../models/index.js';
import { todayLocalDate } from '../../utils/date.js';

export class EnrollmentError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'EnrollmentError';
  }
}

export class EnrollmentService {
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

  async getAllowedLevelForStudent(id_user: number) {
    const allLevels: any[] = await Level.findAll();
    if (allLevels.length === 0) return { currentLevel: null, allowedLevel: null };

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

    await Enrollment.update({
      enrollment_date: data.enrollment_date,
      final_grade: data.final_grade,
      attendance_percentage: data.attendance_percentage,
      id_user: data.id_user,
      id_section: data.id_section,
      status: data.status,
    }, { where: { id_enrollment: id } });

    // Update student level if final grade meets the passing threshold
    const grade = data.final_grade !== undefined && data.final_grade !== null && data.final_grade !== ''
      ? Number(data.final_grade)
      : null;
    const courseLevelCode = existingEnrollment.section?.course?.level_code;

    // Se agrega el nivel aprobado al historial del alumno sin borrar los anteriores.
    // Si ya lo tenía (por ejemplo, se volvió a cargar la nota), se deja la fecha original.
    if (grade !== null && !isNaN(grade) && grade >= 7 && courseLevelCode) {
      await UserLevel.findOrCreate({
        where: { id_user: existingEnrollment.id_user, level_code: Number(courseLevelCode) },
        defaults: { start_date: todayLocalDate() }
      });
    }

    return existingEnrollment;
  }

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
