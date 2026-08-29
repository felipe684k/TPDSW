import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

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
