/**
 * Service de Pagos (capa frontend).
 *
 * Este archivo NO dibuja la pantalla ni habla con MySQL.
 * Solo hace fetch al backend (/api/pagos) y devuelve JSON.
 *
 * Flujo: Pagos.tsx o Dashboard.tsx → pagoService → Express (pago.router) → pago.controller → tabla `pago`.
 *
 * Las 4 funciones de abajo coinciden 1 a 1 con las rutas de
 * fullstack/backend/src/routes/pago.router.ts
 */
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/pagos`;

/** Una cuota del estado de cuenta (puede ser un pago real o una pendiente armada en el controller). */
export interface Cuota {
  id: number | string;
  id_inscripcion?: number;
  comision?: string;
  mes_cuota: string;
  monto: number;
  vencimiento: string;
  estado: string;
  fecha_pago: string | null;
  recargo: number;
  descuento: number;
  metodoPago?: string;
}

/** Body que espera registrarPago en el backend. */
export interface RegistrarPagoPayload {
  id_inscripcion: number;
  mes_cuota: string;
  monto: number;
  recargo: number;
  descuento: number;
  estado: string;
  fecha_pago: string;
}

export interface EstadoCuenta {
  inscripciones: any[];
  cuotas: Cuota[];
}

export interface Moroso {
  id: number;
  nombreCompleto: string;
  dni: string;
  curso: string;
  cuotasImpagas: number;
  deudaTotal: number;
}

export const pagoService = {
  /**
   * GET /api/pagos
   * Lista todos los pagos ya guardados en la DB (no arma cuotas pendientes).
   */
  getAllPagos: async (): Promise<any[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener los pagos');
    const json = await response.json();
    return json.data || [];
  },

  /**
   * GET /api/pagos/alumno/:id_usuario
   * Estado de cuenta: el controller cruza inscripciones + pagos y arma
   * las cuotas de marzo al mes actual (las pendientes no están en la tabla hasta que se cobran).
   */
  getEstadoCuentaAlumno: async (idUsuario: number): Promise<EstadoCuenta> => {
    const response = await fetch(`${API_URL}/alumno/${idUsuario}`);
    if (!response.ok) throw new Error('Error al obtener el estado de cuenta');
    const json = await response.json();
    return json.data || { inscripciones: [], cuotas: [] };
  },

  /**
   * POST /api/pagos
   * Registrar cobro. Si ese mes ya existe para la inscripción, el backend hace UPDATE; si no, CREATE.
   * Requiere id_inscripcion válido (no se cobra un alumno sin inscripción).
   */
  registrarPago: async (payload: RegistrarPagoPayload): Promise<any> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.mensaje || 'No se pudo procesar el pago.');
    }
    return json.data;
  },

  /**
   * GET /api/pagos/morosos
   * Alumnos con inscripción activa y meses vencidos sin estado Pagado.
   * Lo usa el Dashboard para el KPI, no solo la pantalla de Pagos.
   */
  getMorosos: async (): Promise<Moroso[]> => {
    const response = await fetch(`${API_URL}/morosos`);
    if (!response.ok) throw new Error('Error al obtener morosos');
    const json = await response.json();
    return json.data || [];
  },
};
