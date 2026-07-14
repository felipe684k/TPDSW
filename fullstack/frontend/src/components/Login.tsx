import { useState } from 'react'

interface LoginProps {
  onLogin: () => void //onLogin es una funcion que recibe como parametro otro boton que cuando se presione va a cambiar el estado a "conectado"
}

export default function Login({ onLogin }: LoginProps) {
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {  //handlesubmit significa "manejar el envio" de un formulario
    e.preventDefault()  //previene que se recargue la pagina al enviar el formulario 
    
    // Validación estática simple: solo verifica que no estén vacíos
    if (!dni || !password) {
      alert('Por favor, ingresa tu DNI y contraseña.')
      return
    }

    // Llama a la función que cambia el estado a "conectado" en App.tsx
    onLogin()
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
          
          {/* Campo DNI */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Número de DNI
            </label>
            <input 
              type="text" 
              required
              maxLength={8}
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder="Ej. 12345678"
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
              className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-[10px] text-slate-500 select-none">
              Recordar mi sesión en este equipo
            </label>
          </div>

          {/* Botón de envío */}
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg text-xs shadow-lg shadow-blue-600/20 transition-all"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Nota informativa para pruebas */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 text-[10px] text-slate-500 text-center leading-relaxed">
          💡 <strong>Nota del Prototipo:</strong> Podés ingresar escribiendo cualquier DNI y contraseña de ejemplo.
        </div>

      </div>
    </div>
  )
}
