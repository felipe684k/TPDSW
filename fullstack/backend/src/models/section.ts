import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO COMISIÓN  (tabla: section)
 *
 * Un grupo concreto de un curso: tiene aula, ciclo lectivo, horarios y docentes.
 * Es donde se inscriben los alumnos. Horarios y docentes se guardan en tablas intermedias
 * (section_schedule y user_section) porque una comisión puede tener varios de cada uno.
 */
export const Section = sequelize.define('Section', {
  id_section: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Curso que se dicta en esta comisión
  id_course: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Aula donde se cursa
  id_classroom: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Ciclo lectivo al que pertenece
  id_academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'section',
  timestamps: false
});

export default Section;
