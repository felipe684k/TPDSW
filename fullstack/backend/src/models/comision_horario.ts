import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ComisionHorario = sequelize.define('ComisionHorario', {
  id_comision: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_horario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'comision_horario',
  timestamps: false
});

export default ComisionHorario;
