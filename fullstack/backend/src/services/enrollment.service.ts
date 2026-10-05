import { Enrollment, User, Section, Course, Level } from '../models/index.js';

export const getAllEnrollmentsService = async () => {
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
};

export const createEnrollmentService = async (data: any) => {
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section } = data;

    if (!id_user || !id_section) {
        throw { status: 400, message: 'Missing required fields' };
    }

    const newEnrollment: any = await Enrollment.create({
        enrollment_date: enrollment_date || new Date(),
        final_grade,
        attendance_percentage,
        id_user,
        id_section,
        status: 'Active'
    });

    return newEnrollment;
};

export const updateEnrollmentService = async (id: string, data: any) => {
    const { enrollment_date, final_grade, attendance_percentage, id_user, id_section, status } = data;

    const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } });
    if (!existingEnrollment) {
        throw { status: 404, message: 'Enrollment not found' };
    }

    await Enrollment.update({
        enrollment_date,
        final_grade,
        attendance_percentage,
        id_user,
        id_section,
        status,
    }, { where: { id_enrollment: id } });
};

export const deleteEnrollmentService = async (id: string) => {
    const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } });
    if (!existingEnrollment) {
        throw { status: 404, message: 'Enrollment not found' };
    }

    await Enrollment.update(
        { status: 'Dropped' },
        { where: { id_enrollment: id } }
    );
};
