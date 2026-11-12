import { API_BASE_URL } from '../config';

export interface Level {
  level_code?: number;
  name: string;
  next_level_code?: number | null;
}

const API_URL = `${API_BASE_URL}/levels`;

/**
 * Ordena los niveles en orden de progresión (A1 → A2 → ... → C2) siguiendo la cadena next_level_code:
 * empieza por el nivel que no es "siguiente" de ningún otro y avanza de a uno.
 * Los niveles que no forman parte de la cadena se agregan al final.
 */
export function sortLevelsByProgression(levels: Level[]): Level[] {
  const nextCodes = new Set(levels.map(l => l.next_level_code).filter(Boolean));
  let current = levels.find(l => !nextCodes.has(l.level_code)) ?? levels[0];

  const sorted: Level[] = [];
  while (current) {
    sorted.push(current);
    const next = levels.find(l => l.level_code === current?.next_level_code);
    if (!next || sorted.some(l => l.level_code === next.level_code)) break;
    current = next;
  }

  const sortedCodes = new Set(sorted.map(l => l.level_code));
  return [...sorted, ...levels.filter(l => !sortedCodes.has(l.level_code))];
}

export const levelService = {
  getLevels: async (): Promise<Level[]> => {
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
  
  createLevel: async (data: Omit<Level, 'level_code'>): Promise<Level> => {
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
  
  updateLevel: async (id: number, data: Partial<Level>): Promise<Level> => {
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
