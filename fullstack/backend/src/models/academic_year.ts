import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO CICLO LECTIVO  (tabla: academic_year)
 *
 * Período de cursado, por ejemplo "Ciclo 2026" (marzo a diciembre).
 * Cada comisión pertenece a un ciclo lectivo.
 */
export const AcademicYear = sequelize.define('AcademicYear', {
  id_academic_year: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // DATEONLY: solo fecha (AAAA-MM-DD), sin hora
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'academic_year',
  timestamps: false
});

export default AcademicYear;
