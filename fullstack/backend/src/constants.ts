// Valores de negocio que se guardan en la base de datos y se muestran al usuario.
// Se centralizan acá para que backend y base usen siempre el mismo texto en español.

export const ENROLLMENT_STATUS = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  DROPPED: 'Dado de Baja',
} as const;

export const INSTALLMENT_STATUS = {
  PAID: 'Pagado',
  PARTIAL: 'Parcial',
  PENDING: 'Pendiente',
} as const;

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
