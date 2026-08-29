import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserLevel = sequelize.define('UserLevel', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  level_code: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'user_level',
  timestamps: false
});

export default UserLevel;
