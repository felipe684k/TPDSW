import { useState } from 'react';

interface StudentDashboardProps {
  userData: any;
  onLogout: () => void;
}

export default function StudentDashboard({ userData, onLogout }: StudentDashboardProps) {
  const [showData, setShowData] = useState(false);

  const courses = [
    { id: 1, name: 'Advanced English B2', schedule: 'Monday and Wednesday 18:00 - 20:00', professor: 'Prof. Sarah Connor', classroom: 'Classroom 3' },
    { id: 2, name: 'Conversation C1', schedule: 'Friday 17:00 - 19:00', professor: 'Prof. John Smith', classroom: 'Lab A' },
  ];

  const installments = [
    { month: 'August 2026', amount: '$15.000', status: 'Paid', due_date: '10/08/2026' },
    { month: 'September 2026', amount: '$15.000', status: 'Pending', due_date: '10/09/2026' },
  ];

  return (
    <div className="min-h-screen bg-[#16171d] text-slate-200 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-start md:items-center mb-6 bg-[#1c1d24] p-5 rounded-2xl border border-slate-800 shadow-sm flex-col md:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
            {userData?.first_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Hello, {userData?.first_name} {userData?.last_name}</h1>
            <p className="text-sm text-slate-400 mb-2">Student Portal</p>
            <button 
              onClick={() => setShowData(!showData)}
              className="cursor-pointer text-xs font-semibold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20"
            >
              {showData ? 'Hide my info ▲' : 'View my info ▼'}
            </button>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="cursor-pointer text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors px-4 py-2 rounded-lg hover:bg-rose-950/30"
        >
          Logout
        </button>
      </div>

      {/* Expandable Personal Information Section */}
      {showData && (
        <div className="max-w-5xl mx-auto mb-6 bg-[#1c1d24] p-6 rounded-2xl border border-slate-800 shadow-sm transition-all animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>👤</span> Personal Information
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
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Phone</p>
              <p className="text-sm text-slate-300">{userData?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Academic Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Regular Student
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid for Courses and Payments */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Courses */}
        <div className="bg-[#1c1d24] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>📚</span> My Current Courses
          </h2>
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="bg-[#16171d] border border-slate-800/80 rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
                <h3 className="text-base font-bold text-slate-200 mb-2">{course.name}</h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>🕒</span> {course.schedule}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>👨‍🏫</span> {course.professor}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 col-span-2">
                    <span>🚪</span> {course.classroom}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Status / Payments */}
        <div className="bg-[#1c1d24] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>💳</span> Account Status
          </h2>
          <div className="overflow-hidden border border-slate-800/80 rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#16171d] border-b border-slate-800/80">
                  <th className="p-3 text-xs font-semibold text-slate-400">Period</th>
                  <th className="p-3 text-xs font-semibold text-slate-400">Amount</th>
                  <th className="p-3 text-xs font-semibold text-slate-400">Due Date</th>
                  <th className="p-3 text-xs font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {installments.map((inst, idx) => (
                  <tr key={idx} className="bg-[#1c1d24]">
                    <td className="p-3 text-sm text-slate-300">{inst.month}</td>
                    <td className="p-3 text-sm font-mono text-slate-300">{inst.amount}</td>
                    <td className="p-3 text-sm text-slate-400">{inst.due_date}</td>
                    <td className="p-3 text-sm">
                      {inst.status === 'Paid' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/30 text-emerald-400">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950/30 text-amber-400">
                          Pending
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
