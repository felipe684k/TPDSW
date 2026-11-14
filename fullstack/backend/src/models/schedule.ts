import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO HORARIO  (tabla: schedule)
 *
 * Un bloque de horario: día + hora de inicio + hora de fin (ej. lunes de 9 a 11).
 * Se relaciona con las comisiones mediante la tabla intermedia section_schedule.
 */
export const Schedule = sequelize.define('Schedule', {
  id_schedule: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // ENUM: solo acepta estos valores. Se traducen al español con DAY_LABELS (constants.ts)
  day: {
    type: DataTypes.ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'schedule',
  timestamps: false
});

export default Schedule;
