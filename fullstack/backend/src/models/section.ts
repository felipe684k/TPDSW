import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

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
  id_course: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_classroom: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'section',
  timestamps: false
});

export default Section;
