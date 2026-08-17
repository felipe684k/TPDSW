import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Nivel = sequelize.define('Nivel', {
  codigo_nivel: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo_nivel_siguiente: {
    type: DataTypes.INTEGER,
    allowNull: true

}, {
  tableName: 'nivel',
  timestamps: false
});

export default Nivel;
