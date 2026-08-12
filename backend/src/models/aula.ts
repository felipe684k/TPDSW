import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Aula = sequelize.define('Aula', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'aula',
  timestamps: false
});

export default Aula;
