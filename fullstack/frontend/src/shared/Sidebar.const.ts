export const SIDEBAR_TABS = {
  DASHBOARD: 'Panel Principal',
  ENROLLMENTS: 'Inscripciones',
  STUDENTS: 'Alumnos',
  PROFESSORS: 'Profesores',
  COURSES: 'Cursos',
  SECTIONS: 'Comisiones',
  CLASSROOMS: 'Aulas',
  ACADEMIC_YEARS: 'Ciclos Lectivos',
} as const;

export type SidebarTab = typeof SIDEBAR_TABS[keyof typeof SIDEBAR_TABS];
