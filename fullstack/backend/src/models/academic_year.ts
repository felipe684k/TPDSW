import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

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
