export interface Profesor {
  id?: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  fecha_nacimiento?: string;
  usuario: string;
  contrasena: string;
  tipo: 'PROFESOR';
  activo: boolean;
  createdAt?: string; // Para la fecha de ingreso
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/profesores`;

export const profesorService = {
  getProfesores: async (search?: string, estado?: string): Promise<Profesor[]> => {
    try {
      const url = new URL(API_URL);
      if (search) url.searchParams.append('search', search);
      if (estado) url.searchParams.append('estado', estado);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Error al obtener los docentes');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  checkDni: async (dni: string): Promise<Profesor | null> => {
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

  createProfesor: async (profesor: Partial<Profesor>): Promise<Profesor> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profesor),
      });
      if (!response.ok) throw new Error('Error al registrar el docente');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProfesor: async (id: number, profesor: Partial<Profesor>): Promise<Profesor> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profesor),
      });
      if (!response.ok) throw new Error('Error al actualizar el docente');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteProfesor: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al dar de baja el docente');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
