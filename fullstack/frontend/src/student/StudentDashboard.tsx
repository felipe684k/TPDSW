import { useState } from 'react';
import { theme } from '../shared/theme';

interface StudentDashboardProps {
  userData: any;
  onLogout: () => void;
}

export default function StudentDashboard({ userData, onLogout }: StudentDashboardProps) {
  const [showData, setShowData] = useState(false);

  const courses = [
    { id: 1, name: 'Advanced English B2', schedule: 'Lunes y Miércoles 18:00 - 20:00', professor: 'Prof. Sarah Connor', classroom: 'Aula 3' },
    { id: 2, name: 'Conversation C1', schedule: 'Viernes 17:00 - 19:00', professor: 'Prof. John Smith', classroom: 'Lab A' },
  ];

  const installments = [
    { month: 'Agosto 2026', amount: '$15.000', status: 'Paid', due_date: '10/08/2026' },
    { month: 'Septiembre 2026', amount: '$15.000', status: 'Pending', due_date: '10/09/2026' },
  ];

  return (
    <div className={`min-h-screen ${theme.layout.appBackground} font-sans p-4 md:p-8 flex flex-col`}>
      {/* Header Container - Glassmorphism */}
      <div className="relative z-10 max-w-5xl w-full mx-auto flex justify-between items-start md:items-center mb-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/20">
            {userData?.first_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Hola, {userData?.first_name} {userData?.last_name}</h1>
            <p className="text-sm text-white/70 font-medium mb-2 uppercase tracking-widest">Portal del Alumno</p>
            <button 
              onClick={() => setShowData(!showData)}
              className="cursor-pointer text-xs font-semibold bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 transition-transform ${showData ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showData ? 'Ocultar mi información' : 'Ver mi información'}
            </button>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="cursor-pointer text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 border border-transparent hover:border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Expandable Personal Information Section */}
      {showData && (
        <div className="relative z-10 max-w-5xl w-full mx-auto mb-6 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl transition-all animate-fade-in border-t border-l border-white/60">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">DNI</p>
              <p className="text-sm font-medium text-slate-800">{userData?.dni || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm font-medium text-slate-800">{userData?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Teléfono</p>
              <p className="text-sm font-medium text-slate-800">{userData?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Estado Académico</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Alumno Regular
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid for Courses and Payments */}
      <div className="relative z-10 max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Courses */}
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border-t border-l border-white/60">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Mis Cursos Actuales
          </h2>
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-3">{course.name}</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {course.schedule}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {course.professor}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium col-span-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {course.classroom}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Status / Payments */}
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border-t border-l border-white/60">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estado de Cuenta
          </h2>
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Período</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installments.map((inst, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3 text-sm font-medium text-slate-700">{inst.month}</td>
                    <td className="p-3 text-sm font-mono text-slate-600">{inst.amount}</td>
                    <td className="p-3 text-sm text-slate-500">{inst.due_date}</td>
                    <td className="p-3 text-sm">
                      {inst.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold bg-amber-50 text-amber-700 border-amber-200">
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
