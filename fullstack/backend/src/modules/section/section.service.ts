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

export class SectionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'SectionError';
    this.statusCode = statusCode;
  }
}

export class SectionService {
  // Prevent duplicate section names within the same course and academic year
  private async assertNameAvailable(name: any, id_course: number, id_academic_year: number) {
    const cleanName = String(name ?? '').trim();
    if (!cleanName) {
      throw new SectionError('El nombre de la comisión es obligatorio', 400);
    }

    const duplicate = await Section.findOne({
      where: { name: cleanName, id_course, id_academic_year }
    });
    if (duplicate) {
      throw new SectionError(`Ya existe una comisión con el nombre "${cleanName}"`, 409);
    }
    return cleanName;
  }

  async findAll(filters: { id_academic_year?: any } = {}) {
    const where: any = {};
    if (filters.id_academic_year) {
      where.id_academic_year = filters.id_academic_year;
    }

    return await Section.findAll({
      where,
      include: [
        { model: Course, as: 'course', include: [{ model: Level, as: 'level' }] },
        { model: Classroom, as: 'classroom' },
        { model: AcademicYear, as: 'academic_year' },
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
  }

  async findById(id: number) {
    return await Section.findByPk(id, {
      include: [
        { model: Course, as: 'course', include: [{ model: Level, as: 'level' }] },
        { model: Classroom, as: 'classroom' },
        { model: AcademicYear, as: 'academic_year' },
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
  }

  async create(data: CreateSectionDto) {
    const { name, id_course, id_classroom, id_academic_year, schedules, id_professor } = data;
    const sectionName = await this.assertNameAvailable(name, id_course, id_academic_year);

    // Validate schedules (start time before end time)
    if (schedules && schedules.length > 0) {
      for (const reqSchedule of schedules) {
        if (reqSchedule.start_time >= reqSchedule.end_time) {
          const dayName = DAY_LABELS[reqSchedule.day] || reqSchedule.day;
          throw new SectionError(
            `Horario inválido el día ${dayName}: la hora de fin debe ser posterior a la hora de inicio.`,
            400
          );
        }
      }
    }

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
