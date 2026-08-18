export interface ValorCuota {
  id_valor_cuota?: number;
  id_curso: number;
  fecha_desde: string;
  costo_mensual: number;
  curso?: {
    nombre_curso: string;
  };
}

const API_URL = 'http://localhost:3000/api/valores-cuota';

export const valorCuotaService = {
  getValoresCuota: async (): Promise<ValorCuota[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error fetching valores cuota');
    return response.json();
  },

  createValorCuota: async (data: Partial<ValorCuota>): Promise<ValorCuota> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating valor cuota');
    return response.json();
  }
};
