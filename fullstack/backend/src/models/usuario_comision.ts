import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UsuarioComision = sequelize.define('UsuarioComision', {
  dni: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false
  },
  id_comision: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'usuario_comision',
  timestamps: false
});

export default UsuarioComision;
