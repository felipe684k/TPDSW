import { API_BASE_URL } from '../config';

export interface Classroom {
  id?: number;
  name: string;
  capacity: number;
}

const API_URL = `${API_BASE_URL}/classrooms`;

export const classroomService = {
  // TODO: Implementar llamados HTTP hacia el backend usando API_URL
  getClassrooms: async (): Promise<Classroom[]> => {
    console.log('GET', API_URL);
    return [];
  },

  createClassroom: async (_classroom: Classroom): Promise<any> => {
    // Lógica para crear aula
  },

  updateClassroom: async (_id: number, _classroom: Classroom): Promise<any> => {
    // Lógica para actualizar aula
  },

  deleteClassroom: async (_id: number): Promise<any> => {
    // Lógica para eliminar aula
  }
};
