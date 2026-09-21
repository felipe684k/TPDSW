import { API_BASE_URL } from '../config';

export interface Course {
  id_course?: number;
  course_name: string;
  weekly_hours: number;
  days_per_week: number;
  registration_fee: number;
  level_code: number;
  active?: boolean;
  level?: {
    level_code: number;
    name: string;
  };
  tuition_fees?: Array<{
    id_tuition_fee: number;
    monthly_cost: string | number;
    start_date: string;
  }>;
}

const API_URL = `${API_BASE_URL}/courses`;

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error fetching courses');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createCourse: async (courseData: any): Promise<Course> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) throw new Error('Error creating course');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateCourse: async (id: number, courseData: any): Promise<Course> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) throw new Error('Error updating course');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteCourse: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error deactivating course');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
