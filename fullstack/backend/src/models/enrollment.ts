import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Enrollment = sequelize.define('Enrollment', {
  id_enrollment: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enrollment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  final_grade: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  attendance_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_section: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'enrollment',
  timestamps: false
});

export default Enrollment;
