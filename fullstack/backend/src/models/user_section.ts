import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserSection = sequelize.define('UserSection', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_section: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'user_section',
  timestamps: false
});

export default UserSection;
