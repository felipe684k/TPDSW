import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO ARANCEL / CUOTA MENSUAL  (tabla: tuition_fee)
 *
 * Valor de la cuota mensual de un curso a partir de una fecha.
 * Se guarda un historial: cuando cambia el precio se agrega un registro nuevo
 * y para cada mes se usa la cuota vigente en ese momento (ver getMonthlyFee en payment.service.ts).
 */
export const TuitionFee = sequelize.define('TuitionFee', {
  id_tuition_fee: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_course: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Desde cuándo rige este valor
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  monthly_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'tuition_fee',
  timestamps: false
});

export default TuitionFee;
