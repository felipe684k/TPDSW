import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Level = sequelize.define('Level', {
  level_code: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  next_level_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'level',
  timestamps: false
});

export default Level;
