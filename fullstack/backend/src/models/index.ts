/**
 * MODELOS Y RELACIONES
 *
 * Cada archivo de esta carpeta define un modelo de Sequelize: una clase que representa una tabla
 * de MySQL. sequelize.define(nombre, columnas, opciones) describe la tabla, y con el modelo se
 * hacen las consultas sin escribir SQL (findAll, findByPk, create, update, destroy...).
 * timestamps: false → las tablas no tienen las columnas automáticas createdAt / updatedAt.
 *
 * Este archivo importa todos los modelos, define las RELACIONES entre ellos y los exporta juntos.
 * El resto del backend importa los modelos desde acá (así las relaciones ya están configuradas).
 *
 * Cómo se leen las relaciones (siempre se definen de a pares, una para cada lado):
 *   - A.belongsTo(B)      → A "pertenece a" B: la tabla A tiene la clave foránea (ej. section.id_course).
 *   - B.hasMany(A)        → B "tiene muchos" A: el otro lado de la misma relación.
 *   - A.belongsToMany(B)  → muchos a muchos, a través de una tabla intermedia (through).
 *   - as: 'nombre'        → nombre con el que se trae el dato relacionado en un include.
 *                           Ej: Section.findAll({ include: [{ model: Course, as: 'course' }] })
 */
import { sequelize } from '../config/database.js';

import User from './user.js';
import Level from './level.js';
import Course from './course.js';
import TuitionFee from './tuition_fee.js';
import UserLevel from './user_level.js';
import Classroom from './classroom.js';
import AcademicYear from './academic_year.js';
import Section from './section.js';
import UserSection from './user_section.js';
import Schedule from './schedule.js';
import SectionSchedule from './section_schedule.js';
import Enrollment from './enrollment.js';
import Payment from './payment.js';

// ─── RELACIONES ─────────────────────────────────────────────────────────────

// Nivel → nivel siguiente (relación recursiva: la tabla level se relaciona consigo misma)
Level.belongsTo(Level, { as: 'NextLevel', foreignKey: 'next_level_code' });
Level.hasMany(Level, { as: 'PreviousLevels', foreignKey: 'next_level_code' });

// Curso → Nivel: cada curso es de un nivel; un nivel tiene muchos cursos
Course.belongsTo(Level, { foreignKey: 'level_code', as: 'level' });
Level.hasMany(Course, { foreignKey: 'level_code', as: 'courses' });

// Arancel → Curso: un curso tiene muchas cuotas (historial de precios)
TuitionFee.belongsTo(Course, { foreignKey: 'id_course', as: 'course' });
Course.hasMany(TuitionFee, { foreignKey: 'id_course', as: 'tuition_fees' });

// Alumno ↔ Nivel (muchos a muchos con la tabla user_level): historial de niveles aprobados
User.belongsToMany(Level, { through: UserLevel, foreignKey: 'id_user', otherKey: 'level_code', as: 'levels' });
Level.belongsToMany(User, { through: UserLevel, foreignKey: 'level_code', otherKey: 'id_user', as: 'users' });

// Comisión → Curso, Aula y Ciclo lectivo: cada comisión tiene uno de cada uno
Section.belongsTo(Course, { foreignKey: 'id_course', as: 'course' });
Course.hasMany(Section, { foreignKey: 'id_course', as: 'sections' });

Section.belongsTo(Classroom, { foreignKey: 'id_classroom', as: 'classroom' });
Classroom.hasMany(Section, { foreignKey: 'id_classroom', as: 'sections' });

Section.belongsTo(AcademicYear, { foreignKey: 'id_academic_year', as: 'academic_year' });
AcademicYear.hasMany(Section, { foreignKey: 'id_academic_year', as: 'sections' });

// Docente ↔ Comisión (muchos a muchos con la tabla user_section): qué docentes dictan cada comisión
User.belongsToMany(Section, { through: UserSection, foreignKey: 'id_user', otherKey: 'id_section', as: 'sections' });
Section.belongsToMany(User, { through: UserSection, foreignKey: 'id_section', otherKey: 'id_user', as: 'professors' });

// Comisión ↔ Horario (muchos a muchos con la tabla section_schedule): días y horas de cursado
Section.belongsToMany(Schedule, { through: SectionSchedule, foreignKey: 'id_section', otherKey: 'id_schedule', as: 'schedules' });
Schedule.belongsToMany(Section, { through: SectionSchedule, foreignKey: 'id_schedule', otherKey: 'id_section', as: 'sections' });

// Inscripción → Alumno y Comisión: cada inscripción es de un alumno en una comisión
Enrollment.belongsTo(User, { foreignKey: 'id_user', as: 'user' });
User.hasMany(Enrollment, { foreignKey: 'id_user', as: 'enrollments' });

Enrollment.belongsTo(Section, { foreignKey: 'id_section', as: 'section' });
Section.hasMany(Enrollment, { foreignKey: 'id_section', as: 'enrollments' });

// Pago → Inscripción: una inscripción tiene muchos pagos (matrícula y cuotas)
Payment.belongsTo(Enrollment, { foreignKey: 'id_enrollment', as: 'enrollment' });
Enrollment.hasMany(Payment, { foreignKey: 'id_enrollment', as: 'payments' });

// Orden para obtener el nivel actual de un alumno: el primero de la lista 'levels'.
// Se guarda el historial de niveles; el actual es el de fecha más reciente y, si hay dos
// del mismo día, el más avanzado (los niveles se crean en orden, A1 < A2 < ... < C2).
const CURRENT_LEVEL_ORDER: any[] = [
  [{ model: Level, as: 'levels' }, UserLevel, 'start_date', 'DESC'],
  [{ model: Level, as: 'levels' }, 'level_code', 'DESC']
];

export {
  CURRENT_LEVEL_ORDER,
  sequelize,
  User,
  Level,
  Course,
  TuitionFee,
  UserLevel,
  Classroom,
  AcademicYear,
  Section,
  UserSection,
  Schedule,
  SectionSchedule,
  Enrollment,
  Payment
};
