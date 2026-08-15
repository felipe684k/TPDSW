import { useState } from 'react';

interface StudentDashboardProps {
  userData: any;
  onLogout: () => void;
}

export default function StudentDashboard({ userData, onLogout }: StudentDashboardProps) {
  const [showData, setShowData] = useState(false);

  // Datos mockeados para los cursos y cuotas, ya que aún no hay endpoints para esto
  const cursos = [
    { id: 1, nombre: 'Inglés Avanzado B2', horario: 'Lunes y Miércoles 18:00 - 20:00', docente: 'Prof. Sarah Connor', aula: 'Aula 3' },
    { id: 2, nombre: 'Conversación C1', horario: 'Viernes 17:00 - 19:00', docente: 'Prof. John Smith', aula: 'Laboratorio A' },
  ];

  const cuotas = [
    { mes: 'Agosto 2026', monto: '$15.000', estado: 'Pagado', vencimiento: '10/08/2026' },
    { mes: 'Septiembre 2026', monto: '$15.000', estado: 'Pendiente', vencimiento: '10/09/2026' },
  ];

  return (
    <div className="min-h-screen bg-[#16171d] text-slate-200 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-start md:items-center mb-6 bg-[#1c1d24] p-5 rounded-2xl border border-slate-800 shadow-sm flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
            {userData?.nombre?.charAt(0) || 'A'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Hola, {userData?.nombre} {userData?.apellido}</h1>
            <p className="text-sm text-slate-400 mb-2">Portal del Alumno</p>
            <button 
              onClick={() => setShowData(!showData)}
              className="text-xs font-semibold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20"
            >
              {showData ? 'Ocultar mis datos ▲' : 'Ver mis datos ▼'}
            </button>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors px-4 py-2 rounded-lg hover:bg-rose-950/30"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Sección Expandible de Datos Personales */}
      {showData && (
        <div className="max-w-5xl mx-auto mb-6 bg-[#1c1d24] p-6 rounded-2xl border border-slate-800 shadow-sm transition-all animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>👤</span> Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">DNI</p>
              <p className="text-sm font-mono text-slate-300">{userData?.dni || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-slate-300">{userData?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Teléfono</p>
              <p className="text-sm text-slate-300">{userData?.telefono || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Estado Académico</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Alumno Regular
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid Centralizado para Cursos y Cuotas */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cursos */}
        <div className="bg-[#1c1d24] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>📚</span> Mis Cursos Actuales
          </h2>
          <div className="space-y-4">
            {cursos.map(curso => (
              <div key={curso.id} className="bg-[#16171d] border border-slate-800/80 rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
                <h3 className="text-base font-bold text-slate-200 mb-2">{curso.nombre}</h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>🕒</span> {curso.horario}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>👨‍🏫</span> {curso.docente}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 col-span-2">
                    <span>🚪</span> {curso.aula}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuotas */}
        <div className="bg-[#1c1d24] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>💳</span> Estado de Cuenta
          </h2>
          <div className="overflow-hidden border border-slate-800/80 rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#16171d] border-b border-slate-800/80">
                  <th className="p-3 text-xs font-semibold text-slate-400">Período</th>
                  <th className="p-3 text-xs font-semibold text-slate-400">Monto</th>
                  <th className="p-3 text-xs font-semibold text-slate-400">Venc.</th>
                  <th className="p-3 text-xs font-semibold text-slate-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {cuotas.map((cuota, idx) => (
                  <tr key={idx} className="bg-[#1c1d24]">
                    <td className="p-3 text-sm text-slate-300">{cuota.mes}</td>
                    <td className="p-3 text-sm font-mono text-slate-300">{cuota.monto}</td>
                    <td className="p-3 text-sm text-slate-400">{cuota.vencimiento}</td>
                    <td className="p-3 text-sm">
                      {cuota.estado === 'Pagado' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/30 text-emerald-400">
                          Abonado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950/30 text-amber-400">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
