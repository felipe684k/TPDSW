import { API_BASE_URL } from '../config';

export interface Classroom {
  id?: number;
  name: string;
  capacity: number;
}

export const classroomService = {
  getClassrooms: async (): Promise<Classroom[]> => {
    const response = await fetch(`${API_BASE_URL}/classrooms`);
    if (!response.ok) throw new Error('Error al obtener las aulas');
    const json = await response.json();
    return json.data;
  },

  createClassroom: async (classroom: Classroom): Promise<Classroom> => {
    const response = await fetch(`${API_BASE_URL}/classrooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classroom),
    });
    if (!response.ok) throw new Error('Error al crear el aula');
    const json = await response.json();
    return json.data;
  },

  updateClassroom: async (id: number, classroom: Classroom): Promise<Classroom> => {
    const response = await fetch(`${API_BASE_URL}/classrooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classroom),
    });
    if (!response.ok) throw new Error('Error al actualizar el aula');
    const json = await response.json();
    return json.data;
  }
};
