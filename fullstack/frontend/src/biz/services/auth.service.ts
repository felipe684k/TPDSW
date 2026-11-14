import { API_BASE_URL } from '../config';

// Datos del usuario que devuelve el backend al iniciar sesión (sin la contraseña)
export interface LoggedUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  dni: string;
  email?: string | null;
  role: 'ADMIN' | 'STUDENT';
  [key: string]: any;
}

const API_URL = `${API_BASE_URL}/users`;

export const authService = {
  // Envía usuario y contraseña al backend. Si algo falla, lanza un Error con el mensaje para mostrar.
  login: async (username: string, password: string): Promise<LoggedUser> => {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    } catch {
      // fetch solo falla así cuando no se pudo llegar al backend
      throw new Error('Error al conectar al servidor. Por favor verifica que el backend esté corriendo.');
    }

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(json?.message || 'Nombre de usuario o contraseña incorrectos.');
    }
    return json.data;
  }
};
