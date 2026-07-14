import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Comisiones from './components/Comisiones'
import Pagos from './components/Pagos'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import Inscripciones from './components/Inscripciones'
import Alumnos from './components/Alumnos'
import Docentes from './components/Docentes'
import Cursos from './components/Cursos'
import Aulas from './components/Aulas'
import ValorCuota from './components/ValorCuota'
import Login from './components/Login'

export default function App() {
  // Estado para simular si el usuario ya inició sesión o no
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Estado que controla qué página estamos viendo
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inscripciones' | 'alumnos' | 'docentes' | 'cursos' | 'valorCuota' | 'comisiones' | 'pagos' | 'aulas'>('dashboard')


  // Datos globales que se comparten entre componentes
  const [inscripciones, setInscripciones] = useState([
    { id: 1,
      apellido: 'González',
      nombre: 'Lucía', 
      dni: '40.123.456', 
      comision: 'B1 — Mañana', 
      nivel: 'B1', 
      fecha: '02/07/2026', 
      estado: 'Activa' },

    { id: 2, 
      apellido: 'Ramírez', 
      nombre: 'Tomás', 
      dni: '38.901.234', 
      comision: 'A2 — Tarde', 
      nivel: 'A2', 
      fecha: '01/07/2026', 
      estado: 'Pendiente' },

    { id: 3, 
      apellido: 'Fernández', 
      nombre: 'Valentina', 
      dni: '42.567.890', 
      comision: 'A1 — Noche', 
      nivel: 'A1', 
      fecha: '30/06/2026', 
      estado: 'Activa' },

    { id: 4, 
      apellido: 'López', 
      nombre: 'Mateo', 
      dni: '41.234.567', 
      comision: 'B2 — Mañana', 
      nivel: 'B2', 
      fecha: '29/06/2026', 
      estado: 'Moroso' },

    { id: 5, 
      apellido: 'Perez', 
      nombre: 'Antonella', 
      dni: '39.876.543', 
      comision: 'A2 — Mañana', 
      nivel: 'A2', 
      fecha: '28/06/2026', 
      estado: 'Activa' }
  ])

  // Si no está logueado, muestra únicamente la pantalla de Login
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      
      {/* Nuestro componente de menú lateral */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsLoggedIn(false)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Nuestro componente de barra superior */}
        <Topbar activeTab={activeTab} />
        
        {/* El contenedor principal donde mostramos una página u otra */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              inscripciones={inscripciones} 
              setActiveTab={setActiveTab} 
            />
          )}  
          {/*
          Lo que hace el && es que evalua la primera expresion y si es true, 
          muestra la segunda, pero si es falso el && no se gasta en evaluar la segunda opcion
          porque ya sabe que sera falsa la operacion
          */}

          {activeTab === 'inscripciones' && (
            <Inscripciones 
              inscripciones={inscripciones} 
              setInscripciones={setInscripciones} 
            />
          )}

          {activeTab === 'alumnos' && (
            <Alumnos />
          )}

          {activeTab === 'docentes' && (
            <Docentes />
          )}

          {activeTab === 'cursos' && (
            <Cursos />
          )}

          {activeTab === 'aulas' && (
            <Aulas />
          )}

          {activeTab === 'valorCuota' && (
            <ValorCuota />
          )}

          {activeTab === 'comisiones' && (
            <Comisiones />
          )}

          {activeTab === 'pagos' && (
            <Pagos />
          )}


        </div>
      </main>

    </div>
  )
}
