export interface Profesor {
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

const API_URL = 'http://localhost:3000/api/profesores';

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

  updateProfesor: async (dni: string, profesor: Partial<Profesor>): Promise<Profesor> => {
    try {
      const response = await fetch(`${API_URL}/${dni}`, {
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

  deleteProfesor: async (dni: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${dni}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al dar de baja el docente');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
