import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Inscripcion = sequelize.define('Inscripcion', {
  id_inscripcion: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  nota_final: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  porc_asistencia: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  dni: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  id_comision: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'inscripcion',
  timestamps: false
});

export default Inscripcion;
