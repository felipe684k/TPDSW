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

// Relationships
// Recursive Level
Level.belongsTo(Level, { as: 'NextLevel', foreignKey: 'next_level_code' });
Level.hasMany(Level, { as: 'PreviousLevels', foreignKey: 'next_level_code' });

// Course -> Level
Course.belongsTo(Level, { foreignKey: 'level_code', as: 'level' });
Level.hasMany(Course, { foreignKey: 'level_code', as: 'courses' });

// TuitionFee -> Course
TuitionFee.belongsTo(Course, { foreignKey: 'id_course', as: 'course' });
Course.hasMany(TuitionFee, { foreignKey: 'id_course', as: 'tuition_fees' });

// UserLevel (M:N between User and Level)
User.belongsToMany(Level, { through: UserLevel, foreignKey: 'id_user', otherKey: 'level_code', as: 'levels' });
Level.belongsToMany(User, { through: UserLevel, foreignKey: 'level_code', otherKey: 'id_user', as: 'users' });

// Section -> Course, Classroom, AcademicYear
Section.belongsTo(Course, { foreignKey: 'id_course', as: 'course' });
Course.hasMany(Section, { foreignKey: 'id_course', as: 'sections' });

Section.belongsTo(Classroom, { foreignKey: 'id_classroom', as: 'classroom' });
Classroom.hasMany(Section, { foreignKey: 'id_classroom', as: 'sections' });

Section.belongsTo(AcademicYear, { foreignKey: 'id_academic_year', as: 'academic_year' });
AcademicYear.hasMany(Section, { foreignKey: 'id_academic_year', as: 'sections' });

// UserSection (M:N between User and Section)
User.belongsToMany(Section, { through: UserSection, foreignKey: 'id_user', otherKey: 'id_section', as: 'sections' });
Section.belongsToMany(User, { through: UserSection, foreignKey: 'id_section', otherKey: 'id_user', as: 'professors' });

// SectionSchedule (M:N between Section and Schedule)
Section.belongsToMany(Schedule, { through: SectionSchedule, foreignKey: 'id_section', otherKey: 'id_schedule', as: 'schedules' });
Schedule.belongsToMany(Section, { through: SectionSchedule, foreignKey: 'id_schedule', otherKey: 'id_section', as: 'sections' });

// Enrollment -> User, Section
Enrollment.belongsTo(User, { foreignKey: 'id_user', as: 'user' });
User.hasMany(Enrollment, { foreignKey: 'id_user', as: 'enrollments' });

Enrollment.belongsTo(Section, { foreignKey: 'id_section', as: 'section' });
Section.hasMany(Enrollment, { foreignKey: 'id_section', as: 'enrollments' });

// Payment -> Enrollment
Payment.belongsTo(Enrollment, { foreignKey: 'id_enrollment', as: 'enrollment' });
Enrollment.hasMany(Payment, { foreignKey: 'id_enrollment', as: 'payments' });

export {
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
