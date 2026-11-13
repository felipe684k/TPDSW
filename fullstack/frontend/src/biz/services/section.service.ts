import { API_BASE_URL } from '../config';
import type { Course } from './course.service';
import type { Professor as User } from './professor.service';

const API_URL = `${API_BASE_URL}/sections`;

export interface Schedule {
  id_schedule?: number;
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  start_time: string;
  end_time: string;
}

export interface Classroom {
  id?: number;
  name: string;
  capacity: number;
}

export interface SectionEnrollment {
  id_enrollment: number;
  enrollment_date: string;
  status: string;
  final_grade?: number | null;
  attendance_percentage?: number | null;
  user?: {
    id: number;
    dni: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
}

export interface Section {
  id_section?: number;
  name?: string;
  id_course: number;
  id_classroom: number;
  id_academic_year: number;
  course?: Course;
  classroom?: Classroom;
  academic_year?: any;
  schedules?: Schedule[];
  professors?: User[];
  enrolled_count?: number;
  available_spots?: number;
  enrollments?: SectionEnrollment[];
}

export interface SectionFilters {
  id_academic_year?: number | string;
  level?: number | string;
  id_course?: number | string;
}

export const sectionService = {
  getSections: async (params?: number | SectionFilters): Promise<Section[]> => {
    const query = new URLSearchParams();
    if (typeof params === 'number') {
      query.set('id_academic_year', String(params));
    } else if (params && typeof params === 'object') {
      if (params.id_academic_year !== undefined && params.id_academic_year !== '' && params.id_academic_year !== 'all') {
        query.set('id_academic_year', String(params.id_academic_year));
      }
      if (params.level !== undefined && params.level !== '' && params.level !== 'all') {
        query.set('level', String(params.level));
      }
      if (params.id_course !== undefined && params.id_course !== '' && params.id_course !== 'all') {
        query.set('id_course', String(params.id_course));
      }
    }
    const qs = query.toString();
    const url = qs ? `${API_URL}?${qs}` : API_URL;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  createSection: async (sectionData: any): Promise<Section> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error desconocido al crear la comisión');
    return json.data;
  },

  updateSection: async (id: number, sectionData: any): Promise<Section> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error desconocido al actualizar la comisión');
    return json.data;
  },

  deleteSection: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  }
};
