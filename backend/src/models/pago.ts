import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Pago = sequelize.define('Pago', {
  id_pago: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_inscripcion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  recargo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  mes_cuota: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'pago',
  timestamps: false
});

export default Pago;
