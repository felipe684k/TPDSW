import { Enrollment, User, Section, Course, Level } from '../../models/index.js';

export class EnrollmentService {
  async findAll() {
    return await Enrollment.findAll({
      include: [
        { model: User, as: 'user' },
        {
          model: Section, as: 'section',
          include: [
            {
              model: Course, as: 'course',
              include: [{ model: Level, as: 'level' }]
            }
          ]
        }
      ]
    });
  }

  async create(data: {
    enrollment_date: any;
    final_grade: any;
    attendance_percentage: any;
    id_user: any;
    id_section: any;
  }) {
    const newEnrollment: any = await Enrollment.create({
      enrollment_date: data.enrollment_date || new Date(),
      final_grade: data.final_grade,
      attendance_percentage: data.attendance_percentage,
      id_user: data.id_user,
      id_section: data.id_section,
      status: 'Active'
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
    const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } });
    if (!existingEnrollment) {
      return null;
    }

    await Enrollment.update({
      enrollment_date: data.enrollment_date,
      final_grade: data.final_grade,
      attendance_percentage: data.attendance_percentage,
      id_user: data.id_user,
      id_section: data.id_section,
      status: data.status,
    }, { where: { id_enrollment: id } });

    return existingEnrollment;
  }

  async delete(id: any) {
    const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } });
    if (!existingEnrollment) {
      return null;
    }

    await Enrollment.update(
      { status: 'Dropped' },
      { where: { id_enrollment: id } }
    );

    return existingEnrollment;
  }
}
