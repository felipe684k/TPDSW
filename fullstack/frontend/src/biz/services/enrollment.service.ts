import { API_BASE_URL } from '../config';

export interface Enrollment {
    id_enrollment: number;
    enrollment_date: string;
    status: string;
    final_grade?: number;
    attendance_percentage?: number;
    id_user: number;
    id_section: number;
    user?: {
        first_name: string;
        last_name: string;
        dni: string;
    };
    section?: {
        name: string;
        course?: {
            level_code: string;
            level?: {
                name: string;
            };
        };
    };
}

const API_URL = `${API_BASE_URL}/enrollments`;

export const enrollmentService = {

    getEnrollments: async (): Promise<Enrollment[]> => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error fetching enrollments');
            const json = await response.json();
            return json.data || [];
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    createEnrollment: async (enrollmentData: any): Promise<Enrollment> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollmentData),
            });
            if (!response.ok) throw new Error('Error creating enrollment');
            const json = await response.json();
            return json.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    updateEnrollment: async (id: number, enrollmentData: any): Promise<Enrollment> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollmentData),
            });
            if (!response.ok) throw new Error('Error updating enrollment');
            const json = await response.json();
            return json.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    deleteEnrollment: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error deactivating enrollment');
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
};