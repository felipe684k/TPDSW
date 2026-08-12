import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Comision = sequelize.define('Comision', {
  id_comision: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_curso: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_aula: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_ciclo_lectivo: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'comision',
  timestamps: false
});

export default Comision;
