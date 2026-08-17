import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UsuarioNivel = sequelize.define('UsuarioNivel', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  codigo_nivel: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  fecha_desde: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'usuario_nivel',
  timestamps: false
});

export default UsuarioNivel;
