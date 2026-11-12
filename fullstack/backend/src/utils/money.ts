/**
 * Formatea un monto en pesos con formato argentino: punto para miles y coma para decimales.
 * Ejemplos: 12000 -> "$12.000", 1500.5 -> "$1.500,5"
 */
export function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return '$' + (isNaN(amount) ? 0 : amount).toLocaleString('es-AR', { maximumFractionDigits: 2 });
}
