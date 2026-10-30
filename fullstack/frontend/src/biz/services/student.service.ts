export interface Student {
  id?: number;
  dni: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  email?: string;
  username?: string;
  password?: string;
  level_code?: string | number;
  current_level?: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN';
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/users`;

export const studentService = {
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los alumnos');
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

  createStudent: async (student: Omit<Student, 'role'>): Promise<Student> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...student, role: 'STUDENT' }),
      });
      if (!response.ok) throw new Error('Error al registrar el alumno');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateStudent: async (id: number, student: Partial<Student>): Promise<Student> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      if (!response.ok) throw new Error('Error al actualizar el alumno');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteStudent: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al desactivar el alumno');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
