import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { Section, Schedule, SectionSchedule, UserSection, Course, Classroom, AcademicYear, User, Level, Enrollment } from '../../models/index.js';
import { sequelize } from '../../config/database.js';
import { DAY_LABELS } from '../../constants.js';

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

export class SectionError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'SectionError';
  }
}

export class SectionService {
  // Prevent duplicate section names within the same course and academic year
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

  private validateSchedulesList(schedules?: ScheduleItemDto[]) {
    if (!schedules || schedules.length === 0) return;

    for (const reqSchedule of schedules) {
      if (reqSchedule.start_time >= reqSchedule.end_time) {
        const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
        throw new SectionError(
          `Horario inválido el día ${dayName}: la hora de fin debe ser posterior a la hora de inicio.`,
          400
        );
      }
    }

    // Validar que los bloques horarios de la misma comisión no se repitan ni se solapen entre sí
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

  async create(data: CreateSectionDto) {
    const { name, id_course, id_classroom, id_academic_year, schedules, id_professor } = data;
    const sectionName = await this.assertNameAvailable(name, id_course, id_academic_year);

    this.validateSchedulesList(schedules);

    const t = await sequelize.transaction();
    try {
      // Verificar superposición de aulas
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

      // Check professor schedule overlap in the same academic year
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

      // Create section
      const newSection: any = await Section.create(
        { name: sectionName, id_course, id_classroom, id_academic_year },
        { transaction: t }
      );

      // Vincular horarios
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

      // Vincular profesor
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

      if (Number(targetClassroom.capacity) < activeEnrollmentsCount) {
        throw new SectionError(
          `El aula "${targetClassroom.name}" (capacidad ${targetClassroom.capacity}) no alcanza para los ${activeEnrollmentsCount} alumnos inscriptos actualmente en la comisión.`,
          409
        );
      }

      // Check classroom schedule overlap excluding current section
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

      // Check professor schedule overlap excluding current section
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

  async delete(id: number) {
    const t = await sequelize.transaction();
    try {
      const section = await Section.findByPk(id, { transaction: t });
      if (!section) {
        throw new SectionError('Comisión no encontrada', 404);
      }

      // Prevent deleting a section that has enrollments
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
