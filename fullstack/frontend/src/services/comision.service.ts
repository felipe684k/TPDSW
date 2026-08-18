import type { Curso } from './curso.service';
import type { Profesor as Usuario } from './profesor.service';

const API_URL = 'http://localhost:3000/api/comisiones';

export interface Horario {
  id_horario?: number;
  dia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
  hora_inicio: string;
  hora_fin: string;
}

export interface Aula {
  id?: number;
  nombre: string;
  capacidad: number;
}

export interface Comision {
  id_comision?: number;
  nombre?: string;
  id_curso: number;
  id_aula: number;
  id_ciclo_lectivo: number;
  curso?: Curso;
  aula?: Aula;
  ciclo_lectivo?: any;
  horarios?: Horario[];
  profesores?: Usuario[];
}

export const comisionService = {
  getComisiones: async (id_ciclo_lectivo?: number): Promise<Comision[]> => {
    const url = id_ciclo_lectivo ? `${API_URL}?id_ciclo_lectivo=${id_ciclo_lectivo}` : API_URL;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  createComision: async (comisionData: any): Promise<Comision> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comisionData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.mensaje || 'Error desconocido');
    return json.data;
  },

  deleteComision: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.mensaje);
  }
};

export const aulaService = {
  getAulas: async (): Promise<Aula[]> => {
    const res = await fetch('http://localhost:3000/api/aulas');
    const json = await res.json();
    return json.data;
  }
};
