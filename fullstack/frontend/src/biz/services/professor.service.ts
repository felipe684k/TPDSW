import { API_BASE_URL } from '../config';

export interface Professor {
  id?: number;
  dni: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  email?: string;
  role: 'PROFESSOR';
  active?: boolean;
}

const API_URL = `${API_BASE_URL}/professors`;

export const professorService = {
  getProfessors: async (search?: string, status?: string): Promise<Professor[]> => {
    try {
      const url = new URL(API_URL);
      if (search) url.searchParams.append('search', search);
      if (status) url.searchParams.append('status', status);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Error al obtener los profesores');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  checkDni: async (dni: string): Promise<Professor | null> => {
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

  createProfessor: async (professor: Partial<Professor>): Promise<Professor> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(professor),
      });
      if (!response.ok) throw new Error('Error al registrar el profesor');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProfessor: async (id: number, professor: Partial<Professor>): Promise<Professor> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(professor),
      });
      if (!response.ok) throw new Error('Error al actualizar el profesor');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteProfessor: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al desactivar el profesor');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
