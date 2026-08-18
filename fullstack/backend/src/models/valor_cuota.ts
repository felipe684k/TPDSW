import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ValorCuota = sequelize.define('ValorCuota', {
  id_valor_cuota: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_curso: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_desde: {
    type: DataTypes.DATE,
    allowNull: false
  },
  costo_mensual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'valor_cuota',
  timestamps: false
});

export default ValorCuota;
