import { useEffect, useSyncExternalStore } from 'react'
import { API_BASE_URL } from './config'

/**
 * Estado de la conexión con el backend y la base de datos, compartido por toda la app.
 * - checking: todavía no se verificó
 * - ok: backend y base de datos responden
 * - db_down: el backend responde pero la base de datos no (el backend devuelve 503)
 * - api_down: no se puede llegar al backend
 */
export type ConnectionState = 'checking' | 'ok' | 'db_down' | 'api_down'

let state: ConnectionState = 'checking'
const listeners = new Set<() => void>()

function setConnectionState(next: ConnectionState) {
  if (next === state) return
  state = next
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/**
 * Interceptor de fetch (como los interceptores de axios): cada respuesta de la API actualiza el estado.
 * Así cualquier pantalla que pida datos detecta enseguida si se cayó la base o el servidor.
 */
export function installConnectionInterceptor() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const isApiCall = url.startsWith(API_BASE_URL)

    try {
      const response = await originalFetch(input, init)
      if (isApiCall) setConnectionState(response.status === 503 ? 'db_down' : 'ok')
      return response
    } catch (error) {
      if (isApiCall) setConnectionState('api_down')
      throw error
    }
  }
}

/** Estado actual de la conexión (el componente se vuelve a dibujar cuando cambia). */
export function useConnectionState(): ConnectionState {
  return useSyncExternalStore(subscribe, () => state)
}

/** Consulta /health cada `intervalMs` para detectar la caída (y la vuelta) aunque nadie esté pidiendo datos. */
export function useConnectionMonitor(intervalMs = 5000) {
  useEffect(() => {
    const check = () => { fetch(`${API_BASE_URL}/health`).catch(() => {}) }
    check()
    const interval = setInterval(check, intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs])
}
