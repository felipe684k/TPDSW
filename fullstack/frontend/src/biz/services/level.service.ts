import { API_BASE_URL } from '../config';

export interface Level {
  level_code?: number;
  name: string;
  next_level_code?: number | null;
}

const API_URL = `${API_BASE_URL}/levels`;

export const levelService = {
  getLevels: async (): Promise<Level[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error fetching levels');
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  createLevel: async (data: Omit<Level, 'level_code'>): Promise<Level> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error creating level');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  updateLevel: async (id: number, data: Partial<Level>): Promise<Level> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error updating level');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
