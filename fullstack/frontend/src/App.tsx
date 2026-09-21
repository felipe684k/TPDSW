import { SIDEBAR_TABS, type SidebarTab } from './shared/Sidebar.const'
import { useState, useEffect } from 'react'
import Sidebar from './shared/Sidebar'
import Topbar from './shared/Topbar'
import Dashboard from './admin/Dashboard'
import Enrollments from './admin/Enrollments'
import Students from './admin/Students/Students'
import Professors from './admin/Professors'
import Courses from './admin/Courses'
import Classrooms from './admin/Classrooms'
import AcademicYears from './admin/AcademicYears'
import Login from './auth/Login'
import StudentDashboard from './student/StudentDashboard'

import { theme } from './shared/theme'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  const [userRole, setUserRole] = useState<'ADMIN' | 'STUDENT'>(() => {
    return (localStorage.getItem('userRole') as any) || 'ADMIN'
  })

  const [userData, setUserData] = useState<any>(() => {
    const saved = localStorage.getItem('userData')
    return saved ? JSON.parse(saved) : null
  })

  const [activeTab, setActiveTab] = useState<SidebarTab>(() => {
    return (localStorage.getItem('activeTab') as any) || 'dashboard'
  })

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userRole', userRole)
      if (userData) localStorage.setItem('userData', JSON.stringify(userData))
    } else {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userData')
      localStorage.removeItem('activeTab')
    }
  }, [isLoggedIn, userRole, userData])

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab)
  }, [activeTab])

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [enrollments, setEnrollments] = useState([
    {
      id: 1,
      last_name: 'González',
      first_name: 'Lucía',
      dni: '40.123.456',
      section: 'B1 — Mañana',
      level: 'B1',
      date: '07/02/2026',
      status: 'Active'
    },
    {
      id: 2,
      last_name: 'Ramírez',
      first_name: 'Tomás',
      dni: '38.901.234',
      section: 'A2 — Tarde',
      level: 'A2',
      date: '07/01/2026',
      status: 'Pending'
    },
    {
      id: 3,
      last_name: 'Fernández',
      first_name: 'Valentina',
      dni: '42.567.890',
      section: 'A1 — Noche',
      level: 'A1',
      date: '06/30/2026',
      status: 'Active'
    },
    {
      id: 4,
      last_name: 'López',
      first_name: 'Mateo',
      dni: '41.234.567',
      section: 'B2 — Mañana',
      level: 'B2',
      date: '06/29/2026',
      status: 'Overdue'
    },
    {
      id: 5,
      last_name: 'Perez',
      first_name: 'Antonella',
      dni: '39.876.543',
      section: 'A2 — Mañana',
      level: 'A2',
      date: '06/28/2026',
      status: 'Active'
    }
  ])

  if (!isLoggedIn) {
    return <Login onLogin={(role, data) => {
      setUserRole(role);
      setUserData(data);
      setIsLoggedIn(true);
      setActiveTab(SIDEBAR_TABS.DASHBOARD);
    }} />
  }

  if (userRole === 'STUDENT') {
    return <StudentDashboard userData={userData} onLogout={() => setIsLoggedIn(false)} />
  }

  return (
    <div className={`flex h-screen text-slate-800 font-sans overflow-hidden ${theme.layout.appBackground}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsLoggedIn(false)} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar activeTab={activeTab} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={`flex-1 overflow-y-auto p-6 ${theme.layout.mainContainer}`}>
          {activeTab === SIDEBAR_TABS.DASHBOARD && (
            <Dashboard
              enrollments={enrollments}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === SIDEBAR_TABS.ENROLLMENTS && (
            <Enrollments
              enrollments={enrollments}
              setEnrollments={setEnrollments}
            />
          )}

          {activeTab === SIDEBAR_TABS.STUDENTS && (
            <Students />
          )}

          {activeTab === SIDEBAR_TABS.PROFESSORS && (
            <Professors />
          )}

          {activeTab === SIDEBAR_TABS.COURSES && (
            <Courses />
          )}

          {activeTab === SIDEBAR_TABS.CLASSROOMS && (
            <Classrooms />
          )}

          {activeTab === SIDEBAR_TABS.ACADEMIC_YEARS && (
            <AcademicYears />
          )}
        </div>
      </main>
    </div>
  )
}
