import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO PAGO  (tabla: payment)
 *
 * Cada cobro de una cuota mensual o de la matrícula de una inscripción.
 * Una cuota se puede pagar en varias partes: hay un registro por cada pago.
 */
export const Payment = sequelize.define('Payment', {
  id_payment: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Inscripción a la que corresponde el pago
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
  // Recargo y descuento: hoy siempre se guardan en 0 (quedan para una mejora futura)
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
  // Estado de la cuota después de este pago: Pagado o Parcial
  status: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  // Qué se paga: el mes de la cuota ("Marzo"...) o "Matrícula"
  installment_month: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Efectivo'
  }
}, {
  tableName: 'payment',
  timestamps: false
});

export default Payment;
