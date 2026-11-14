import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO AULA  (tabla: classroom)
 *
 * Espacio físico donde se dicta una comisión.
 * Su capacidad es el cupo máximo de alumnos de las comisiones que la usan.
 */
export const Classroom = sequelize.define('Classroom', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  // Cantidad máxima de alumnos: se usa para validar el cupo al inscribir
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'classroom',
  timestamps: false
});

export default Classroom;
