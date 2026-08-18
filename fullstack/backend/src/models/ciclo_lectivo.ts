import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CicloLectivo = sequelize.define('CicloLectivo', {
  id_ciclo_lectivo: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_desde: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_hasta: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'ciclo_lectivo',
  timestamps: false
});

export default CicloLectivo;
