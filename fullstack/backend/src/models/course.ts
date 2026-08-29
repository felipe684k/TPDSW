import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Course = sequelize.define('Course', {
  id_course: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  course_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  weekly_hours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  days_per_week: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  registration_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  level_code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'course',
  timestamps: false
});

export default Course;
