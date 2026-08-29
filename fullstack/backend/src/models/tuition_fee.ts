import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const TuitionFee = sequelize.define('TuitionFee', {
  id_tuition_fee: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_course: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  monthly_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'tuition_fee',
  timestamps: false
});

export default TuitionFee;
