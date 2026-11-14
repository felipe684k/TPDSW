/**
 * UTILIDADES DE FECHAS
 *
 * Las fechas del negocio (inscripción, vencimiento de cuotas, pagos) siempre se calculan en hora
 * argentina, sin importar la zona horaria del servidor (en un deploy el servidor suele estar en UTC).
 * Es la misma zona que usa la base: ver config/database.ts.
 */
export const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

// 'en-CA' da el formato AAAA-MM-DD
const argentinaDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: ARGENTINA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/**
 * Fecha (AAAA-MM-DD) que corresponde a ese instante en Argentina.
 * No usar date.toISOString(): está en UTC y después de las 21:00 devuelve el día siguiente.
 */
export function toArgentinaDateString(date: Date): string {
  return argentinaDateFormat.format(date);
}

/** Fecha de hoy en Argentina, en formato AAAA-MM-DD. */
export function todayLocalDate(): string {
  return toArgentinaDateString(new Date());
}

/** Año y mes (1 a 12) actuales en Argentina. */
export function currentArgentinaYearMonth(): { year: number; month: number } {
  const [year, month] = todayLocalDate().split('-').map(Number) as [number, number];
  return { year, month };
}
