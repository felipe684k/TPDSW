import { useState } from 'react'

export interface Enrollment {
  id: number
  last_name: string
  first_name: string
  dni: string
  section: string
  level: string
  date: string
  status: string
  final_grade?: string
  attendance_percentage?: string
}

interface EnrollmentsProps {
  enrollments: Enrollment[]
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>
}

const getUniqueId = () => Date.now();

export default function Enrollments({ enrollments, setEnrollments }: EnrollmentsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  
  const cerrarModal = () => setModalOpen(false)

  const [formStudent, setFormStudent] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formPayment, setFormPayment] = useState('')

  const availableStudents = [
    { id: 1, 
      fullName: 'González, Lucía', 
      dni: '40.123.456' },

    { id: 2, 
      fullName: 'Ramírez, Tomás', 
      dni: '38.901.234' },

    { id: 3, 
      fullName: 'Fernández, Valentina', 
      dni: '42.567.890' }
  ]

  const availableSections = [
    { id: 1, 
      name: 'Kids 1 - A', 
      registration_fee: 8000 },
    { id: 2, 
      name: 'Teens 3 - Noche', 
      registration_fee: 10000 },
    { id: 3, 
      name: 'First Certificate Prep', 
      registration_fee: 15000 }
  ]

  const selectedSection = availableSections.find(s => s.id.toString() === formSection)
  const basePrice = selectedSection ? selectedSection.registration_fee : 0
  const registrationFeeAmount = formPayment === 'cash' ? basePrice * 0.9 : basePrice

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStudent || !formSection || !formPayment) {
      alert('Please select a student, a section, and a payment method for the registration fee.')
      return
    }

    const student = availableStudents.find(a => a.id.toString() === formStudent)

    const newEnrollment: Enrollment = {
      id: getUniqueId(),
      last_name: student?.fullName.split(',')[0] || '',
      first_name: student?.fullName.split(',')[1].trim() || '',
      dni: student?.dni || '',
      section: selectedSection?.name || '',
      level: '-', 
      date: new Date().toLocaleDateString('en-US'),
      status: 'Active', 
      final_grade: '-',
      attendance_percentage: '0%'
    }

    setEnrollments([newEnrollment, ...enrollments])
    setModalOpen(false)
    
    setFormStudent('')
    setFormSection('')
    setFormPayment('')
  }

  const handleDelete = (id: number) => {
    if (confirm('Cancel this enrollment?')) {
      setEnrollments(enrollments.filter((i: Enrollment) => i.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Enrollments</h1>
          <p className="text-xs text-slate-500 mt-1">List of students enrolled in sections.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all">
          ➕ New Enrollment
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs flex gap-2.5">
        <span className="text-sm">ℹ️</span>
        <div>Students without a prior level must take a <strong>diagnostic evaluation</strong> before being assigned to a section.</div>
      </div>

      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-300">List of Enrollments</div>
          <span className="text-2xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
            Total: {enrollments.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17181e] border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Section</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Level</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Final Grade</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {enrollments.map((i) => (
                <tr key={i.id} className="hover:bg-[#17181e] transition-colors">
                  <td className="p-3 text-xs font-semibold text-slate-200">{i.last_name}, {i.first_name}</td>
                  <td className="p-3 text-xs font-mono text-slate-400">{i.dni}</td>
                  <td className="p-3 text-xs text-slate-400">{i.section}</td>
                  <td className="p-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-950/30 text-indigo-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{i.level}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">{i.date}</td>
                  <td className="p-3 text-xs font-semibold text-slate-400">{i.attendance_percentage || '0%'}</td>
                  <td className="p-3 text-xs font-semibold text-slate-400">{i.final_grade || '-'}</td>
                  <td className="p-3 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                      i.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                      i.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-950/30 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        i.status === 'Active' ? 'bg-emerald-500' :
                        i.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-950/300'
                      }`}></span>
                      {i.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <button 
                      onClick={() => handleDelete(i.id)} 
                      className="text-rose-500 hover:text-rose-400 hover:bg-rose-950/30 px-2 py-1 rounded text-2xs font-medium transition-colors cursor-pointer"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: NEW ENROLLMENT
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1d24] border border-slate-800 rounded-xl shadow-2xl w-full md:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">📝 Register Enrollment</h2>
              <button 
                onClick={cerrarModal}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Student Section */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Student Selection</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Student to enroll *</label>
                  <select 
                    required value={formStudent} onChange={e => setFormStudent(e.target.value)}
                    className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="">— Select Registered Student —</option>
                    {availableStudents.map(a => (
                      <option key={a.id} value={a.id}>{a.fullName} (DNI: {a.dni})</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1">⚠️ The student must have already been created in the "Students" module.</span>
                </div>
              </div>

              {/* Section Section */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Section Selection</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Section *</label>
                  <select 
                    required value={formSection} onChange={e => setFormSection(e.target.value)}
                    className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="">— Select Section —</option>
                    {availableSections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Registration and Payment Section */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Registration Fee Payment (Immediate Settlement)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Payment method *</label>
                    <select 
                      required value={formPayment} onChange={e => setFormPayment(e.target.value)}
                      className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="">— Select —</option>
                      <option value="cash">Cash (-10%)</option>
                      <option value="transfer">Transfer</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Amount to pay today</label>
                    <input 
                      type="text" readOnly value={formPayment ? `$${registrationFeeAmount.toLocaleString('en-US')}` : ''}
                      placeholder="$0" className="border border-slate-800 bg-[#17181e] rounded p-2 text-xs outline-none font-bold text-slate-100"
                    />
                    {formPayment === 'cash' && (
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">✅ Cash discount applied.</span>
                    )}
                  </div>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button 
                type="button" onClick={cerrarModal}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" onClick={handleConfirm}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
              >
                Confirm Registration
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
