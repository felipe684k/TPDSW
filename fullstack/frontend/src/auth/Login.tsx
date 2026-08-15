import { useState } from 'react'

interface LoginProps {
  onLogin: (role: 'ADMIN' | 'ALUMNO', userData: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    
    if (!username || !password) {
      setErrorMsg('Por favor, ingresa tu usuario y contraseña.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: username, contrasena: password })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMsg(data.mensaje || 'Usuario o contraseña incorrectos.')
        setIsLoading(false)
        return
      }

      // data.data contiene el usuario encontrado y su tipo ('ADMIN' o 'ALUMNO')
      onLogin(data.data.tipo as 'ADMIN' | 'ALUMNO', data.data)
      
    } catch (error) {
      console.error(error)
      setErrorMsg('Error al conectar con el servidor. Verifica que el backend esté corriendo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">  {/*Este div representa el fondo, todo esto es para poder centrar la tarjeta*/}
      {/* Tarjeta de login principal */}    
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2x1 overflow-hidden p-8 space-y-6"> {/*Este div representa la tarjeta de login*/}
        
        {/* Encabezado con Logo del Instituto */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-blue-600/30">
            🎓
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Instituto de Inglés
          </h2>
          <p className="text-xs text-slate-500">
            Ingresa a tu cuenta para gestionar el ciclo lectivo
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Usuario */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Usuario
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ej. admin"
              className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">
                Contraseña
              </label>
              <a href="#" className="text-[10px] text-indigo-400 hover:underline">
                ¿La olvidaste?
              </a>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Recordar sesión */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-indigo-400 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-[10px] text-slate-500 select-none">
              Recordar mi sesión en este equipo
            </label>
          </div>

          {/* Botón de envío */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg text-xs shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Mensaje de error */}
        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-800/80 rounded-lg p-3 text-[11px] text-rose-400 text-center">
            ❌ {errorMsg}
          </div>
        )}

        {/* Nota informativa para pruebas */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 text-[10px] text-slate-500 text-center leading-relaxed">
          💡 <strong>Credenciales de Prueba:</strong> Podés usar <strong>admin</strong> / <strong>12345</strong> para el panel de secretaría, o <strong>user</strong> / <strong>12345</strong> para ver el panel de alumno.
        </div>

      </div>
    </div>
  )
}
