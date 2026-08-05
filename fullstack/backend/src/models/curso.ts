import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Curso = sequelize.define('Curso', {
  id_curso: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_curso: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  horas_mensuales: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  matricula: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  codigo_nivel: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'curso',
  timestamps: false
});

export default Curso;
