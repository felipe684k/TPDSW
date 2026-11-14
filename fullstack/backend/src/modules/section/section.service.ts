import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { Section, Schedule, SectionSchedule, UserSection, Course, Classroom, AcademicYear, User, Level, Enrollment } from '../../models/index.js';
import { sequelize } from '../../config/database.js';
import { DAY_LABELS } from '../../constants.js';

/**
 * SERVICE DE COMISIONES
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No sabe nada de HTTP (no usa req ni res): si algo no se puede hacer, lanza un SectionError
 * con su código y el controller lo deriva al middleware de errores.
 *
 * CASO DE USO 1: crear y editar comisiones validando que el aula y el docente
 * no estén ocupados en el mismo horario (dentro del mismo ciclo lectivo).
 */

// DTO (Data Transfer Object): forma de los datos que llegan del front para crear o editar una comisión
// Un bloque de horario: día + hora de inicio + hora de fin
export interface ScheduleItemDto {
  day: string;
  start_time: string;
  end_time: string;
}

export interface CreateSectionDto {
  name: string;
  id_course: number;
  id_classroom: number;
  id_academic_year: number;
  schedules?: ScheduleItemDto[];
  id_professor?: number;
}

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class SectionError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'SectionError';
  }
}

export class SectionService {
  // ─── VALIDACIONES INTERNAS (private: solo se usan dentro de esta clase) ───

  // El nombre es obligatorio y no se puede repetir dentro del mismo curso y ciclo lectivo.
  // excludeId: al editar, se excluye la propia comisión para que no choque consigo misma.
  private async assertNameAvailable(name: any, id_course: number, id_academic_year: number, excludeId?: number) {
    const cleanName = String(name ?? '').trim();
    if (!cleanName) {
      throw new SectionError('El nombre de la comisión es obligatorio', 400);
    }

    const where: any = { name: cleanName, id_course, id_academic_year };
    if (excludeId !== undefined) {
      where.id_section = { [Op.ne]: excludeId };
    }

    const duplicate = await Section.findOne({ where });
    if (duplicate) {
      throw new SectionError(`Ya existe una comisión con el nombre "${cleanName}"`, 409);
    }
    return cleanName;
  }

  // Agrega a la comisión la cantidad de inscriptos activos y el cupo disponible
  // (capacidad del aula menos inscriptos que no están dados de baja)
  private formatSectionWithSpots(section: any) {
    const plain = typeof section.toJSON === 'function' ? section.toJSON() : section;
    const capacity = Number(plain.classroom?.capacity) || 0;
    const enrollments = Array.isArray(plain.enrollments) ? plain.enrollments : [];
    const activeEnrollments = enrollments.filter((e: any) => e.status !== 'Dado de Baja');
    const enrolled_count = activeEnrollments.length;
    const available_spots = Math.max(0, capacity - enrolled_count);
    return {
      ...plain,
      enrolled_count,
      available_spots
    };
  }

  // Valida los horarios cargados para la comisión, antes de consultar la base
  private validateSchedulesList(schedules?: ScheduleItemDto[]) {
    if (!schedules || schedules.length === 0) return;

    // Cada bloque tiene que terminar después de empezar
    for (const reqSchedule of schedules) {
      if (reqSchedule.start_time >= reqSchedule.end_time) {
        const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
        throw new SectionError(
          `Horario inválido el día ${dayName}: la hora de fin debe ser posterior a la hora de inicio.`,
          400
        );
      }
    }

    // Validar que los bloques horarios de la misma comisión no se repitan ni se solapen entre sí.
    // Se compara cada par de bloques (i con j). Dos horarios se superponen si son el mismo día y
    // uno empieza antes de que el otro termine y termina después de que el otro empieza.
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i]!;
        const b = schedules[j]!;
        if (a.day === b.day && a.start_time < b.end_time && a.end_time > b.start_time) {
          const dayName = DAY_LABELS[a.day] || a.day;
          throw new SectionError(
            `Los horarios cargados para la comisión se superponen entre sí el día ${dayName} (${a.start_time.slice(0, 5)}–${a.end_time.slice(0, 5)} y ${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}).`,
            409
          );
        }
      }
    }
  }

  // ─── CONSULTAS ───

  // Listado de comisiones con filtros opcionales por ciclo lectivo, curso y nivel.
  // Trae todo lo necesario para mostrar y para el detalle: curso, aula, ciclo, horarios, docentes e inscriptos.
  async findAll(filters: { id_academic_year?: any; level?: any; id_course?: any } = {}) {
    const where: any = {};

    if (filters.id_academic_year !== undefined && filters.id_academic_year !== '' && filters.id_academic_year !== 'all') {
      const yearId = Number(filters.id_academic_year);
      if (!Number.isInteger(yearId) || yearId <= 0) {
        throw new SectionError('El ciclo lectivo indicado para filtrar no es válido', 400);
      }
      where.id_academic_year = yearId;
    }

    if (filters.id_course !== undefined && filters.id_course !== '' && filters.id_course !== 'all') {
      const courseId = Number(filters.id_course);
      if (!Number.isInteger(courseId) || courseId <= 0) {
        throw new SectionError('El curso indicado para filtrar no es válido', 400);
      }
      where.id_course = courseId;
    }

    // El nivel no es una columna de la comisión sino de su curso: se filtra en el include del curso
    const courseWhere: any = {};
    if (filters.level !== undefined && filters.level !== '' && filters.level !== 'all') {
      const levelCode = Number(filters.level);
      if (!Number.isInteger(levelCode) || levelCode <= 0) {
        throw new SectionError('El nivel indicado para filtrar no es válido', 400);
      }
      courseWhere.level_code = levelCode;
    }

    const hasCourseFilter = Object.keys(courseWhere).length > 0;

    const sections = await Section.findAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          where: hasCourseFilter ? courseWhere : undefined,
          // required: true hace un INNER JOIN: solo quedan las comisiones cuyo curso cumple el filtro
          required: hasCourseFilter,
          include: [{ model: Level, as: 'level' }]
        },
        { model: Classroom, as: 'classroom' },
        { model: AcademicYear, as: 'academic_year' },
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            { model: User, as: 'user', attributes: ['id', 'dni', 'first_name', 'last_name', 'email', 'phone'] }
          ]
        }
      ]
    });

    return sections.map((s) => this.formatSectionWithSpots(s));
  }

  // Detalle de una comisión (con los mismos datos relacionados que el listado). null si no existe.
  async findById(id: number) {
    const section = await Section.findByPk(id, {
      include: [
        { model: Course, as: 'course', include: [{ model: Level, as: 'level' }] },
        { model: Classroom, as: 'classroom' },
        { model: AcademicYear, as: 'academic_year' },
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            { model: User, as: 'user', attributes: ['id', 'dni', 'first_name', 'last_name', 'email', 'phone'] }
          ]
        }
      ]
    });
    if (!section) return null;
    return this.formatSectionWithSpots(section);
  }

  // ─── CASO DE USO 1: CREAR Y EDITAR COMISIONES ───

  /**
   * Crea una comisión con sus horarios y su docente.
   * Pasos: valida nombre y horarios → verifica que el aula y el docente estén libres en esos
   * horarios → crea la comisión → vincula horarios y docente. Todo dentro de una transacción:
   * si algo falla, se deshace todo (rollback).
   */
  async create(data: CreateSectionDto) {
    const { name, id_course, id_classroom, id_academic_year, schedules, id_professor } = data;
    const sectionName = await this.assertNameAvailable(name, id_course, id_academic_year);

    this.validateSchedulesList(schedules);

    const t = await sequelize.transaction();
    try {
      // Verificar superposición de aulas: para cada horario nuevo se buscan comisiones de la
      // misma aula y el mismo ciclo que ese día tengan un horario que se pise con el nuevo
      // (empieza antes de que el nuevo termine y termina después de que el nuevo empieza)
      if (schedules && schedules.length > 0) {
        const overlaps: string[] = [];

        for (const reqSchedule of schedules) {
          const overlapping = await Section.findAll({
            where: { id_classroom, id_academic_year },
            include: [{
              model: Schedule,
              as: 'schedules',
              where: {
                day: reqSchedule.day,
                [Op.or]: [
                  {
                    start_time: { [Op.lt]: reqSchedule.end_time },
                    end_time: { [Op.gt]: reqSchedule.start_time }
                  }
                ]
              }
            }],
            transaction: t
          });

          if (overlapping.length > 0) {
            for (const overlapSection of overlapping) {
              const block = (overlapSection as any).schedules[0];
              const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
              overlaps.push(`El ${dayName} de ${block.start_time.slice(0, 5)} a ${block.end_time.slice(0, 5)} (ocupada por "${(overlapSection as any).name}")`);
            }
          }
        }

        if (overlaps.length > 0) {
          throw new SectionError(
            `El aula ya se encuentra ocupada en los siguientes horarios:\n- ${overlaps.join('\n- ')}`,
            409
          );
        }
      }

      // Verificar superposición del docente: misma lógica, pero buscando comisiones del mismo
      // ciclo que dicte ese docente (sin importar el aula)
      if (id_professor && schedules && schedules.length > 0) {
        const profOverlaps: string[] = [];

        for (const reqSchedule of schedules) {
          const overlappingProf = await Section.findAll({
            where: { id_academic_year },
            include: [
              {
                model: User,
                as: 'professors',
                where: { id: id_professor }
              },
              {
                model: Schedule,
                as: 'schedules',
                where: {
                  day: reqSchedule.day,
                  [Op.or]: [
                    {
                      start_time: { [Op.lt]: reqSchedule.end_time },
                      end_time: { [Op.gt]: reqSchedule.start_time }
                    }
                  ]
                }
              }
            ],
            transaction: t
          });

          if (overlappingProf.length > 0) {
            for (const overlapSection of overlappingProf) {
              const block = (overlapSection as any).schedules[0];
              const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
              profOverlaps.push(`El ${dayName} de ${block.start_time.slice(0, 5)} a ${block.end_time.slice(0, 5)} (en "${(overlapSection as any).name}")`);
            }
          }
        }

        if (profOverlaps.length > 0) {
          throw new SectionError(
            `El profesor ya dicta otra comisión en los siguientes horarios:\n- ${profOverlaps.join('\n- ')}`,
            409
          );
        }
      }

      // Todo libre: se crea la comisión
      const newSection: any = await Section.create(
        { name: sectionName, id_course, id_classroom, id_academic_year },
        { transaction: t }
      );

      // Vincular horarios: findOrCreate reutiliza el horario si ya existe (ej. "lunes 9 a 11")
      // y si no lo crea; después se agrega la fila en la tabla intermedia section_schedule
      if (schedules && schedules.length > 0) {
        for (const h of schedules) {
          const [scheduleObj] = await Schedule.findOrCreate({
            where: { day: h.day, start_time: h.start_time, end_time: h.end_time },
            transaction: t
          });
          await SectionSchedule.create({
            id_section: newSection.id_section,
            id_schedule: (scheduleObj as any).id_schedule
          }, { transaction: t });
        }
      }

      // Vincular docente (tabla intermedia user_section)
      if (id_professor) {
        await UserSection.create({
          id_user: id_professor,
          id_section: newSection.id_section
        }, { transaction: t });
      }

      await t.commit();
      return newSection;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Edita una comisión. Hace las mismas validaciones que create, pero excluyendo a la propia
   * comisión (Op.ne = "distinto de") para que no choque consigo misma.
   * Además no deja cambiar el curso si ya hay inscriptos, ni pasar a un aula sin lugar para ellos.
   * Partial<CreateSectionDto>: todos los campos son opcionales; lo que no se envía queda como estaba.
   */
  async update(id: number, data: Partial<CreateSectionDto>) {
    const existingSection: any = await Section.findByPk(id, {
      include: [
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors' }
      ]
    });

    if (!existingSection) {
      return null;
    }

    // Valores finales ("target"): el nuevo si se envió, o el actual de la comisión si no
    const targetCourseId = data.id_course !== undefined ? Number(data.id_course) : Number(existingSection.id_course);
    const targetAcademicYearId = data.id_academic_year !== undefined ? Number(data.id_academic_year) : Number(existingSection.id_academic_year);
    const targetClassroomId = data.id_classroom !== undefined ? Number(data.id_classroom) : Number(existingSection.id_classroom);
    const targetProfessorId = data.id_professor !== undefined
      ? (data.id_professor ? Number(data.id_professor) : undefined)
      : existingSection.professors?.[0]?.id;
    const targetSchedules: ScheduleItemDto[] = data.schedules !== undefined
      ? data.schedules
      : (existingSection.schedules || []).map((s: any) => ({
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time
        }));

    const sectionName = data.name !== undefined
      ? await this.assertNameAvailable(data.name, targetCourseId, targetAcademicYearId, id)
      : existingSection.name;

    this.validateSchedulesList(targetSchedules);

    const t = await sequelize.transaction();
    try {
      const activeEnrollmentsCount = await Enrollment.count({
        where: { id_section: id, status: { [Op.ne]: 'Dado de Baja' } },
        transaction: t
      });

      // Con alumnos inscriptos no se puede cambiar el curso (cambiaría lo que están cursando)
      if (activeEnrollmentsCount > 0 && targetCourseId !== Number(existingSection.id_course)) {
        throw new SectionError(
          'No se puede cambiar el curso de una comisión que ya tiene alumnos inscriptos.',
          409
        );
      }

      const targetClassroom: any = await Classroom.findByPk(targetClassroomId, { transaction: t });
      if (!targetClassroom) {
        throw new SectionError('El aula seleccionada no existe.', 404);
      }

      // La nueva aula tiene que tener lugar para los alumnos que ya están inscriptos
      if (Number(targetClassroom.capacity) < activeEnrollmentsCount) {
        throw new SectionError(
          `El aula "${targetClassroom.name}" (capacidad ${targetClassroom.capacity}) no alcanza para los ${activeEnrollmentsCount} alumnos inscriptos actualmente en la comisión.`,
          409
        );
      }

      // Verificar superposición de aulas (igual que en create, sin contar esta comisión)
      if (targetSchedules && targetSchedules.length > 0) {
        const overlaps: string[] = [];

        for (const reqSchedule of targetSchedules) {
          const overlapping = await Section.findAll({
            where: {
              id_classroom: targetClassroomId,
              id_academic_year: targetAcademicYearId,
              id_section: { [Op.ne]: id }
            },
            include: [{
              model: Schedule,
              as: 'schedules',
              where: {
                day: reqSchedule.day,
                [Op.or]: [
                  {
                    start_time: { [Op.lt]: reqSchedule.end_time },
                    end_time: { [Op.gt]: reqSchedule.start_time }
                  }
                ]
              }
            }],
            transaction: t
          });

          if (overlapping.length > 0) {
            for (const overlapSection of overlapping) {
              const block = (overlapSection as any).schedules[0];
              const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
              overlaps.push(`El ${dayName} de ${block.start_time.slice(0, 5)} a ${block.end_time.slice(0, 5)} (ocupada por "${(overlapSection as any).name}")`);
            }
          }
        }

        if (overlaps.length > 0) {
          throw new SectionError(
            `El aula ya se encuentra ocupada en los siguientes horarios:\n- ${overlaps.join('\n- ')}`,
            409
          );
        }
      }

      // Verificar superposición del docente (igual que en create, sin contar esta comisión)
      if (targetProfessorId && targetSchedules && targetSchedules.length > 0) {
        const profOverlaps: string[] = [];

        for (const reqSchedule of targetSchedules) {
          const overlappingProf = await Section.findAll({
            where: {
              id_academic_year: targetAcademicYearId,
              id_section: { [Op.ne]: id }
            },
            include: [
              {
                model: User,
                as: 'professors',
                where: { id: targetProfessorId }
              },
              {
                model: Schedule,
                as: 'schedules',
                where: {
                  day: reqSchedule.day,
                  [Op.or]: [
                    {
                      start_time: { [Op.lt]: reqSchedule.end_time },
                      end_time: { [Op.gt]: reqSchedule.start_time }
                    }
                  ]
                }
              }
            ],
            transaction: t
          });

          if (overlappingProf.length > 0) {
            for (const overlapSection of overlappingProf) {
              const block = (overlapSection as any).schedules[0];
              const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
              profOverlaps.push(`El ${dayName} de ${block.start_time.slice(0, 5)} a ${block.end_time.slice(0, 5)} (en "${(overlapSection as any).name}")`);
            }
          }
        }

        if (profOverlaps.length > 0) {
          throw new SectionError(
            `El profesor ya dicta otra comisión en los siguientes horarios:\n- ${profOverlaps.join('\n- ')}`,
            409
          );
        }
      }

      await existingSection.update(
        {
          name: sectionName,
          id_course: targetCourseId,
          id_classroom: targetClassroomId,
          id_academic_year: targetAcademicYearId
        },
        { transaction: t }
      );

      // Si se enviaron horarios nuevos: se borran los vínculos viejos y se crean los nuevos
      if (data.schedules !== undefined) {
        await SectionSchedule.destroy({ where: { id_section: id }, transaction: t });
        for (const h of targetSchedules) {
          const [scheduleObj] = await Schedule.findOrCreate({
            where: { day: h.day, start_time: h.start_time, end_time: h.end_time },
            transaction: t
          });
          await SectionSchedule.create({
            id_section: id,
            id_schedule: (scheduleObj as any).id_schedule
          }, { transaction: t });
        }
      }

      // Lo mismo con el docente
      if (data.id_professor !== undefined) {
        await UserSection.destroy({ where: { id_section: id }, transaction: t });
        if (targetProfessorId) {
          await UserSection.create({
            id_user: targetProfessorId,
            id_section: id
          }, { transaction: t });
        }
      }

      await t.commit();
      return await this.findById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ─── ELIMINAR ───

  // Elimina la comisión y sus vínculos con horarios y docentes (borrado físico, en una transacción)
  async delete(id: number) {
    const t = await sequelize.transaction();
    try {
      const section = await Section.findByPk(id, { transaction: t });
      if (!section) {
        throw new SectionError('Comisión no encontrada', 404);
      }

      // No se puede eliminar una comisión que tiene (o tuvo) alumnos inscriptos
      const enrolledCount = await Enrollment.count({ where: { id_section: id }, transaction: t });
      if (enrolledCount > 0) {
        throw new SectionError('No se puede eliminar la comisión porque tiene alumnos inscriptos', 409);
      }

      await SectionSchedule.destroy({ where: { id_section: id }, transaction: t });
      await UserSection.destroy({ where: { id_section: id }, transaction: t });
      await section.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
