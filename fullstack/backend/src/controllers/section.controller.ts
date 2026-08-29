import type { Request, Response } from 'express';
import { Section, Schedule, SectionSchedule, UserSection, Course, Classroom, AcademicYear, User } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

export const getSections = async (req: Request, res: Response) => {
  try {
    const { id_academic_year } = req.query;
    
    const filter: any = {};
    if (id_academic_year) {
      filter.id_academic_year = id_academic_year;
    }

    const sections = await Section.findAll({
      where: filter,
      include: [
        { model: Course, as: 'course' },
        { model: Classroom, as: 'classroom' },
        { model: AcademicYear, as: 'academic_year' },
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
    res.json({ success: true, data: sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ success: false, message: 'Error fetching sections' });
  }
};

export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const section = await Section.findByPk(Number(id), {
      include: [
        { model: Course, as: 'course' },
        { model: Classroom, as: 'classroom' },
        { model: AcademicYear, as: 'academic_year' },
        { model: Schedule, as: 'schedules' },
        { model: User, as: 'professors', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }
    res.json({ success: true, data: section });
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ success: false, message: 'Error fetching section' });
  }
};

export const createSection = async (req: Request, res: Response): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id_course, id_classroom, id_academic_year, schedules, id_professor } = req.body;

    // Validate that start time is before end time
    if (schedules && schedules.length > 0) {
      for (const reqSchedule of schedules) {
        if (reqSchedule.start_time >= reqSchedule.end_time) {
          await t.rollback();
          res.status(400).json({ 
            success: false, 
            message: `Invalid schedule on ${reqSchedule.day}: End time must be after start time.` 
          });
          return;
        }
      }
    }

    // Check classroom overlaps
    if (schedules && schedules.length > 0) {
      const overlaps: string[] = [];
      
      for (const reqSchedule of schedules) {
        // Find sections in the same classroom and academic year
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
        await t.rollback();
        res.status(409).json({ 
          success: false, 
          message: `The classroom is already occupied at the following times:\n- ${overlaps.join('\n- ')}` 
        });
        return;
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
        // Find or create schedule block
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
    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    await t.rollback();
    console.error('Error creating section:', error);
    res.status(500).json({ success: false, message: 'Error creating section' });
  }
};

export const updateSection = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ success: false, message: 'Not implemented. Please delete and create a new section.' });
};

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const section = await Section.findByPk(Number(id));
    if (!section) {
      await t.rollback();
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }
    
    await SectionSchedule.destroy({ where: { id_section: id }, transaction: t });
    await UserSection.destroy({ where: { id_section: id }, transaction: t });
    await section.destroy({ transaction: t });
    
    await t.commit();
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, message: 'Error deleting section' });
  }
};
