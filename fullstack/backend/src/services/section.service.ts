import { Section, Schedule, SectionSchedule, UserSection, Course, Classroom, AcademicYear, User } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

export const getSectionsService = async (id_academic_year?: number) => {
  const filter: any = {};
  if (id_academic_year) {
    filter.id_academic_year = id_academic_year;
  }

  return await Section.findAll({
    where: filter,
    include: [
      { model: Course, as: 'course' },
      { model: Classroom, as: 'classroom' },
      { model: AcademicYear, as: 'academic_year' },
      { model: Schedule, as: 'schedules' },
      { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] }
    ]
  });
};

export const getSectionByIdService = async (id: number) => {
  return await Section.findByPk(id, {
    include: [
      { model: Course, as: 'course' },
      { model: Classroom, as: 'classroom' },
      { model: AcademicYear, as: 'academic_year' },
      { model: Schedule, as: 'schedules' },
      { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] }
    ]
  });
};

export const createSectionService = async (data: any) => {
  const { id_course, id_classroom, id_academic_year, schedules, id_professor } = data;
  const t = await sequelize.transaction();

  try {
    // Validate that start time is before end time
    if (schedules && schedules.length > 0) {
      for (const reqSchedule of schedules) {
        if (reqSchedule.start_time >= reqSchedule.end_time) {
          throw { status: 400, message: `Invalid schedule on ${reqSchedule.day}: End time must be after start time.` };
        }
      }
    }

    // Check classroom overlaps
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
            overlaps.push(`On ${reqSchedule.day} from ${block.start_time.slice(0,5)} to ${block.end_time.slice(0,5)} (occupied by "${(overlapSection as any).name}")`);
          }
        }
      }

      if (overlaps.length > 0) {
        throw { status: 409, message: `The classroom is already occupied at the following times:\n- ${overlaps.join('\n- ')}` };
      }
    }

    // Generate section name automatically
    const previousSections = await Section.count({ where: { id_course, id_academic_year }, transaction: t });
    const courseData: any = await Course.findByPk(id_course, { transaction: t });
    const generatedName = `Section ${previousSections + 1} - ${courseData?.course_name || ''}`;

    // Create the section
    const newSection: any = await Section.create({ name: generatedName, id_course, id_classroom, id_academic_year }, { transaction: t });

    // Link Schedules
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

    // Link Professor
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
};

export const deleteSectionService = async (id: number) => {
  const t = await sequelize.transaction();
  try {
    const section = await Section.findByPk(id);
    if (!section) {
      throw { status: 404, message: 'Section not found' };
    }
    
    await SectionSchedule.destroy({ where: { id_section: id }, transaction: t });
    await UserSection.destroy({ where: { id_section: id }, transaction: t });
    await section.destroy({ transaction: t });
    
    await t.commit();
  } catch (error: any) {
    await t.rollback();
    if (error?.original?.code === 'ER_ROW_IS_REFERENCED_2') {
      throw { status: 400, message: 'No se puede eliminar esta comisión porque tiene alumnos inscriptos.' };
    }
    throw error;
  }
};
