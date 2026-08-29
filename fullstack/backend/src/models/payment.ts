import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Payment = sequelize.define('Payment', {
  id_payment: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_enrollment: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  surcharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  installment_month: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'payment',
  timestamps: false
});

export default Payment;
