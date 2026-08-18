const API_URL = 'http://localhost:3000/api/ciclos-lectivos';

export interface CicloLectivo {
  id_ciclo_lectivo?: number;
  nombre: string;
  fecha_desde: string;
  fecha_hasta: string;
}

export const cicloLectivoService = {
  getCiclos: async (): Promise<CicloLectivo[]> => {
    const res = await fetch(API_URL);
    const json = await res.json();
    return json.data;
  },

  createCiclo: async (ciclo: CicloLectivo): Promise<CicloLectivo> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ciclo)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.mensaje);
    return json.data;
  },

  updateCiclo: async (id: number, ciclo: Partial<CicloLectivo>): Promise<CicloLectivo> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ciclo)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.mensaje);
    return json.data;
  },

  deleteCiclo: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.mensaje);
  }
};
