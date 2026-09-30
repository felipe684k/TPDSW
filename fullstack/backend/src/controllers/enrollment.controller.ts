import { type Request, type Response } from 'express';
import { Enrollment, User, Section, Course, Level } from '../models/index.js';

export const getAllEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
        const enrollments = await Enrollment.findAll({
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
        })
        res.status(200).json({ status: 'ok', data: enrollments })
    } catch (error: any) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
    }
}

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { enrollment_date, final_grade, attendance_percentage, id_user, id_section } = req.body;

        if (!id_user || !id_section) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return
        }

        const newEnrollment: any = await Enrollment.create({
            enrollment_date: enrollment_date || new Date(),
            final_grade,
            attendance_percentage,
            id_user,
            id_section,
            status: 'Active'
        })

        res.status(201).json({ status: 'ok', message: 'Enrollment created successfully', data: newEnrollment });
    } catch (error: any) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
}

export const updateEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { enrollment_date, final_grade, attendance_percentage, id_user, id_section, status } = req.body;

        const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } })
        if (!existingEnrollment) {
            res.status(404).json({ status: 'error', message: 'Enrollment not found' });
            return;
        }

        await Enrollment.update({
            enrollment_date,
            final_grade,
            attendance_percentage,
            id_user,
            id_section,
            status,
        }, { where: { id_enrollment: id } });

        res.status(200).json({ status: 'ok', message: 'Enrollment updated successfully' });

    } catch (error: any) {
        console.error('Error updating enrollment:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
}

export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existingEnrollment = await Enrollment.findOne({ where: { id_enrollment: id } })
        if (!existingEnrollment) {
            res.status(404).json({ status: 'error', message: 'Enrollment not found' });
            return;
        }

        await Enrollment.update(
            { status: 'Dropped' },
            { where: { id_enrollment: id } }
        );

        res.status(200).json({ status: 'ok', message: 'Enrollment deactivated successfully' });
    } catch (error: any) {
        console.error('Error deactivating enrollment:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
}