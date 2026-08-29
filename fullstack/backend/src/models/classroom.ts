import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Classroom = sequelize.define('Classroom', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'classroom',
  timestamps: false
});

export default Classroom;
