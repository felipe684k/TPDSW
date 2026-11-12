// Utilidades de fechas para mostrar siempre el formato argentino (día/mes/año).

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Convierte una fecha a "dd/mm/aaaa".
 * - "2026-11-12" (fecha sin hora, como las guarda la base): se reacomoda sin pasar por Date,
 *   porque new Date("2026-11-12") la toma en UTC y en Argentina mostraría el día anterior.
 * - Fecha con hora o un objeto Date: se muestra el día según la hora local.
 * - Si ya viene como "dd/mm/aaaa", se devuelve igual.
 */
export function formatDateAR(value: string | Date | null | undefined): string {
  if (!value) return ''

  if (typeof value === 'string') {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`
  }

  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return String(value)
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/**
 * Fecha de hoy como "aaaa-mm-dd" (el formato que espera el backend y los <input type="date">),
 * según la hora local. No usar new Date().toISOString(): está en UTC y después de las 21:00
 * devuelve el día siguiente.
 */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
