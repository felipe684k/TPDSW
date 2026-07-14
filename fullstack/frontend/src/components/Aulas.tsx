import { useState } from 'react'

export default function Aulas() {
  // Las aulas son fijas (precargadas) por la infraestructura del instituto
  const [aulas] = useState([
    { id: 1, nombre: 'Aula 1', capacidad: 25 },
    { id: 2, nombre: 'Aula 2', capacidad: 30 },
    { id: 3, nombre: 'Laboratorio de Idiomas', capacidad: 20 },
    { id: 4, nombre: 'Aula 3', capacidad: 15 },
    { id: 5, nombre: 'Auditorio', capacidad: 80 },
  ])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Aulas y Espacios</h1>
          <p className="text-xs text-slate-500 mt-1">Consulta de la infraestructura física precargada del instituto.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-xs font-semibold text-slate-700">Listado de Espacios Disponibles</div>
          <span className="text-2xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
            Total: {aulas.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre del Espacio</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capacidad Máxima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aulas.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span className="text-sm">🏫</span> {a.nombre}
                  </td>
                  <td className="p-3 text-xs font-mono text-slate-500">{a.capacidad} alumnos</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
