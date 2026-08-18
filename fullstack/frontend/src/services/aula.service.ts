import { API_BASE_URL } from '../config';

export interface Aula {
  id?: number;
  nombre: string;
  capacidad: number;
}

export const aulaService = {
  getAulas: async (): Promise<Aula[]> => {
    const response = await fetch(`${API_BASE_URL}/aulas`);
    if (!response.ok) throw new Error('Error al obtener aulas');
    const json = await response.json();
    return json.data;
  },

  createAula: async (aula: Aula): Promise<Aula> => {
    const response = await fetch(`${API_BASE_URL}/aulas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aula),
    });
    if (!response.ok) throw new Error('Error al crear aula');
    const json = await response.json();
    return json.data;
  },

  updateAula: async (id: number, aula: Aula): Promise<Aula> => {
    const response = await fetch(`${API_BASE_URL}/aulas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aula),
    });
    if (!response.ok) throw new Error('Error al actualizar aula');
    const json = await response.json();
    return json.data;
  }
};
