export interface Student {
  id?: number;
  dni: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  email?: string;
  username: string;
  password: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN';
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/users`;

export const studentService = {
  // Get all students (API already filters by STUDENT role)
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error fetching students');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  checkDni: async (dni: string): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/check-dni/${dni}`);
      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // Create a new student
  createStudent: async (student: Omit<Student, 'role'>): Promise<Student> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...student, role: 'STUDENT' }),
      });
      if (!response.ok) throw new Error('Error creating student');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Update an existing student by ID
  updateStudent: async (id: number, student: Partial<Student>): Promise<Student> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      if (!response.ok) throw new Error('Error updating student');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Delete a student by ID
  deleteStudent: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error deleting student');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
