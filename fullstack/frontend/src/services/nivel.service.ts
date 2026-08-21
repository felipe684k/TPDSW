import { API_BASE_URL } from '../config';

export interface Nivel {
  codigo_nivel?: number;
  nombre: string;
  codigo_nivel_siguiente?: number | null;
}

const API_URL = `${API_BASE_URL}/niveles`;

export const nivelService = {
  getNiveles: async (): Promise<Nivel[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los niveles');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  createNivel: async (data: Omit<Nivel, 'codigo_nivel'>): Promise<Nivel> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al crear el nivel');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  updateNivel: async (id: number, data: Partial<Nivel>): Promise<Nivel> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar el nivel');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
