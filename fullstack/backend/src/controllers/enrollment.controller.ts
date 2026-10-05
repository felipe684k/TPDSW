import { type Request, type Response } from 'express';
import {
    getAllEnrollmentsService,
    createEnrollmentService,
    updateEnrollmentService,
    deleteEnrollmentService
} from '../services/enrollment.service.js';

export const getAllEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
        const enrollments = await getAllEnrollmentsService();
        res.status(200).json({ status: 'ok', data: enrollments });
    } catch (error: any) {
        console.error('Error fetching enrollments:', error);
        res.status(error.status || 500).json({ status: error.status ? 'error' : 'db_error', message: error.message || 'Internal error', data: [] });
    }
}

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
        const newEnrollment = await createEnrollmentService(req.body);
        res.status(201).json({ status: 'ok', message: 'Enrollment created successfully', data: newEnrollment });
    } catch (error: any) {
        console.error('Error creating enrollment:', error);
        res.status(error.status || 500).json({ status: error.status ? 'error' : 'db_error', message: error.message || 'Internal error' });
    }
}

export const updateEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await updateEnrollmentService(id, req.body);
        res.status(200).json({ status: 'ok', message: 'Enrollment updated successfully' });
    } catch (error: any) {
        console.error('Error updating enrollment:', error);
        res.status(error.status || 500).json({ status: error.status ? 'error' : 'db_error', message: error.message || 'Internal error' });
    }
}

export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await deleteEnrollmentService(id);
        res.status(200).json({ status: 'ok', message: 'Enrollment deactivated successfully' });
    } catch (error: any) {
        console.error('Error deactivating enrollment:', error);
        res.status(error.status || 500).json({ status: error.status ? 'error' : 'db_error', message: error.message || 'Internal error' });
    }
}