import { useConnectionState } from '../biz/connectionStatus'

const MESSAGES = {
  db_down: {
    title: 'Sin conexión con la base de datos',
    detail: 'Los datos que ves pueden no estar actualizados y no se pueden guardar cambios. El sistema se reconecta solo cuando la base vuelve a estar disponible.',
  },
  api_down: {
    title: 'Sin conexión con el servidor',
    detail: 'No se puede comunicar con el backend. Verificá que esté en ejecución; el sistema se reconecta solo.',
  },
} as const

// Aviso visible en cualquier pantalla cuando se cae la base de datos o el servidor
export default function ConnectionBanner() {
  const connection = useConnectionState()
  if (connection !== 'db_down' && connection !== 'api_down') return null

  const { title, detail } = MESSAGES[connection]
  return (
    <div role="alert" className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 mb-4">
      <span className="text-lg leading-none">⚠️</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-rose-600/90 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}
