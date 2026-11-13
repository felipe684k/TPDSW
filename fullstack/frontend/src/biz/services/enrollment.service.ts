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
        id?: number;
        first_name: string;
        last_name: string;
        dni: string;
        email?: string;
        phone?: string;
        birth_date?: string;
        current_level?: {
            level_code: number;
            name: string;
        } | null;
        levels?: Array<{
            level_code: number;
            name: string;
        }>;
        enrollments?: Array<{
            id_enrollment: number;
            enrollment_date: string;
            status: string;
            final_grade?: number | null;
            attendance_percentage?: number | null;
            id_section: number;
            section?: {
                id_section?: number;
                name: string;
                academic_year?: {
                    id_academic_year?: number;
                    name: string;
                };
                course?: {
                    id_course?: number;
                    course_name?: string;
                    level_code: string | number;
                    level?: {
                        name: string;
                    };
                };
            };
        }>;
    };
    section?: {
        id_section?: number;
        name: string;
        academic_year?: {
            id_academic_year?: number;
            name: string;
        };
        course?: {
            id_course?: number;
            course_name?: string;
            level_code: string;
            level?: {
                name: string;
            };
        };
    };
}

const API_URL = `${API_BASE_URL}/enrollments`;

export const enrollmentService = {

    getEnrollments: async (id_section?: number | string): Promise<Enrollment[]> => {
        try {
            const url = (id_section !== undefined && id_section !== '' && id_section !== 'all')
                ? `${API_URL}?id_section=${encodeURIComponent(id_section)}`
                : API_URL;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener las inscripciones');
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
            const json = await response.json();
            if (!response.ok) throw new Error(json.message || 'Error al crear la inscripción');
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
            if (!response.ok) throw new Error('Error al actualizar la inscripción');
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
            if (!response.ok) throw new Error('Error al desactivar la inscripción');
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};
