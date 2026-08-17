export interface Student {
  id?: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_nacimiento?: string;
  email?: string;
  usuario: string;
  contrasena: string;
  tipo: 'ALUMNO' | 'PROFESOR' | 'ADMIN';
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/users`;

export const studentService = {
  // Obtener todos los alumnos
  // Nota: Como la API devuelve todos los usuarios, filtramos solo los que son ALUMNO
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los alumnos');
      const json = await response.json();
      // El backend devuelve los datos dentro de una propiedad 'data' y ya filtrados por 'ALUMNO'
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

  // Crear un nuevo alumno
  createStudent: async (student: Omit<Student, 'tipo'>): Promise<Student> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Nos aseguramos de forzar el tipo a 'ALUMNO'
        body: JSON.stringify({ ...student, tipo: 'ALUMNO' }),
      });
      if (!response.ok) throw new Error('Error al crear el alumno');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Actualizar un alumno existente por su ID
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

  // Eliminar un alumno por su ID
  deleteStudent: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el alumno');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
