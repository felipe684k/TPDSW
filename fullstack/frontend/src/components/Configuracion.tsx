import React from 'react';
import aulas from '../data/aulas.json';
import horarios from '../data/horarios.json';
import niveles from '../data/niveles.json';

type ConfiguracionProps = {
  cicloActivo: boolean;
  setCicloActivo: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Configuracion({ cicloActivo, setCicloActivo }: ConfiguracionProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Configuración del Sistema</h1>
        <button
          onClick={() => setCicloActivo(!cicloActivo)}
          className={`px-4 py-2 rounded transition-colors ${cicloActivo ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white shadow-lg font-medium`}
        >
          {cicloActivo ? 'Cerrar ciclo lectivo' : 'Iniciar ciclo lectivo'}
        </button>
      </header>

      {/* Aulas */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Aulas</h2>
          <button disabled className="px-3 py-1 text-sm text-slate-500 bg-slate-100 rounded cursor-not-allowed">
            Próximamente
          </button>
        </div>
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="border-b border-slate-200 text-slate-900 font-medium">
            <tr>
              <th className="pb-2">ID</th>
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Capacidad</th>
            </tr>
          </thead>
          <tbody>
            {aulas.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-2">{a.id}</td>
                <td className="py-2">{a.nombre}</td>
                <td className="py-2">{a.capacidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Horarios */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Horarios</h2>
          <button disabled className="px-3 py-1 text-sm text-slate-500 bg-slate-100 rounded cursor-not-allowed">
            Próximamente
          </button>
        </div>
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="border-b border-slate-200 text-slate-900 font-medium">
            <tr>
              <th className="pb-2">ID</th>
              <th className="pb-2">Descripción</th>
              <th className="pb-2">Inicio</th>
              <th className="pb-2">Fin</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-2">{h.id}</td>
                <td className="py-2">{h.descripcion}</td>
                <td className="py-2">{h.inicio}</td>
                <td className="py-2">{h.fin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Niveles */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Niveles</h2>
          {/* Niveles son estáticos, sin botón */}
        </div>
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="border-b border-slate-200 text-slate-900 font-medium">
            <tr>
              <th className="pb-2">ID</th>
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {niveles.map((n) => (
              <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-2">{n.id}</td>
                <td className="py-2">{n.nombre}</td>
                <td className="py-2">{n.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
