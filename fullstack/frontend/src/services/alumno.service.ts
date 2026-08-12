export interface Alumno {
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_nacimiento?: string;
  email?: string;
  usuario: string;
  contrasena: string;
  tipo: 'ALUMNO' | 'PROFESOR' | 'ADMIN';
}

const API_URL = 'http://localhost:3000/api/users';

export const alumnoService = {
  // Obtener todos los alumnos
  // Nota: Como la API devuelve todos los usuarios, filtramos solo los que son ALUMNO
  getAlumnos: async (): Promise<Alumno[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los alumnos');
      const json = await response.json();
      // El backend devuelve los datos dentro de una propiedad 'data' y ya filtrados por 'ALUMNO'
      return json.data || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Crear un nuevo alumno
  createAlumno: async (alumno: Omit<Alumno, 'tipo'>): Promise<Alumno> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Nos aseguramos de forzar el tipo a 'ALUMNO'
        body: JSON.stringify({ ...alumno, tipo: 'ALUMNO' }),
      });
      if (!response.ok) throw new Error('Error al crear el alumno');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Actualizar un alumno existente por su DNI
  updateAlumno: async (dni: string, alumno: Partial<Alumno>): Promise<Alumno> => {
    try {
      const response = await fetch(`${API_URL}/${dni}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alumno),
      });
      if (!response.ok) throw new Error('Error al actualizar el alumno');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Eliminar un alumno por su DNI
  deleteAlumno: async (dni: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${dni}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el alumno');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
