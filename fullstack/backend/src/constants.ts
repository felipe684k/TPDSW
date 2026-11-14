/**
 * CONSTANTES DEL NEGOCIO
 *
 * Valores que se guardan en la base de datos y se muestran al usuario.
 * Se centralizan acá para que todo el backend use siempre el mismo texto en español
 * (si se escribiera a mano en cada archivo, un error de tipeo rompería las comparaciones).
 * "as const" hace que TypeScript los trate como valores fijos que no se pueden modificar.
 */

// Estados de una inscripción
export const ENROLLMENT_STATUS = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  DROPPED: 'Dado de Baja',
} as const;

// Estados de una cuota (o de la matrícula) en el estado de cuenta
export const INSTALLMENT_STATUS = {
  PAID: 'Pagado',
  PARTIAL: 'Parcial',
  PENDING: 'Pendiente',
  UPCOMING: 'A vencer', // todavía no venció: se puede pagar por adelantado y no cuenta como deuda
} as const;

// Nombre con el que se guarda y se muestra el pago de la matrícula (en lugar de un mes)
export const REGISTRATION_INSTALLMENT = 'Matrícula';

// Medios de pago aceptados al cobrar
export const PAYMENT_METHOD = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia Bancaria',
  CARD: 'Tarjeta de Débito/Crédito',
} as const;

// Los días se guardan como código (ENUM) y se traducen solo para mostrarlos
export const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
};
