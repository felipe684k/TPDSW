import { useState } from 'react'
import { API_BASE_URL } from '../biz/config'

interface LoginProps {
  onLogin: (role: 'ADMIN' | 'STUDENT', userData: any) => void
} // definimos el tipo que tiene que ser props (objeto que recibe la funcion Login)

export default function Login({ onLogin }: LoginProps) { 
  // {onLogin} es la unica propiedad de props, se usa para no tener que poner props.onLogin todo el tiempo, 
  // en este instante todavia no se ejecuto la funcion
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    
    if (!username || !password) {
      setErrorMsg('Por favor ingresa tu nombre de usuario y contraseña.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMsg(data.message || 'Nombre de usuario o contraseña incorrectos.')
        setIsLoading(false)
        return
      }

      onLogin(data.data.role as 'ADMIN' | 'STUDENT', data.data)
      
    } catch (error) {
      console.error(error)
      setErrorMsg('Error al conectar al servidor. Por favor verifica que el backend esté corriendo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Login Card */}    
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500"> 
        
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 to-blue-500"></div>

        <div className="p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-50 to-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-sm border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                Portal Educativo
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Acceso al sistema de gestión institucional
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-4">
              {/* Username Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="ej. admin"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium">
                    ¿Olvidaste tu clave?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Remember session */}
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 select-none cursor-pointer">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Submit button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 rounded-lg text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-sm text-red-600 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer info block */}
        <div className="bg-slate-50 border-t border-slate-100 p-5 text-center">
          <p className="text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Modo Demo</span> - Credenciales disponibles:
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shadow-sm">
              <span className="font-semibold text-blue-600">admin</span> / 12345
            </span>
            <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shadow-sm">
              <span className="font-semibold text-emerald-600">user</span> / 12345
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
