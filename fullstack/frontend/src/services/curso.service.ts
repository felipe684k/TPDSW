import { API_BASE_URL } from '../config';

export interface Curso {
  id_curso?: number;
  nombre_curso: string;
  horas_semanales: number;
  dias_por_semana: number;
  matricula: number;
  codigo_nivel: number;
  activo?: boolean;
  nivel?: {
    codigo_nivel: number;
    nombre: string;
  };
  valores_cuota?: Array<{
    id_valor_cuota: number;
    costo_mensual: string | number;
    fecha_desde: string;
  }>;
}

const API_URL = `${API_BASE_URL}/cursos`;

export const cursoService = {
  getCursos: async (): Promise<Curso[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los cursos');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createCurso: async (cursoData: any): Promise<Curso> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoData),
      });
      if (!response.ok) throw new Error('Error al registrar el curso');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateCurso: async (id: number, cursoData: any): Promise<Curso> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoData),
      });
      if (!response.ok) throw new Error('Error al actualizar el curso');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteCurso: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al desactivar el curso');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
