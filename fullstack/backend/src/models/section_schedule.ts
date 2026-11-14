import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO COMISIÓN-HORARIO  (tabla: section_schedule)
 *
 * Tabla intermedia de la relación muchos a muchos entre comisión y horario.
 * La clave primaria es compuesta (id_section + id_schedule): no se repite el mismo par.
 */
export const SectionSchedule = sequelize.define('SectionSchedule', {
  id_section: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_schedule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'section_schedule',
  timestamps: false
});

export default SectionSchedule;
