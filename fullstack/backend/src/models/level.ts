import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO NIVEL  (tabla: level)
 *
 * Niveles de inglés: A1, A2, B1, B2, C1, C2.
 * Cada nivel apunta al siguiente (next_level_code): así se sabe a qué nivel puede
 * inscribirse un alumno según el último que aprobó.
 */
export const Level = sequelize.define('Level', {
  level_code: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Nivel siguiente (relación recursiva: apunta a otra fila de esta misma tabla). C2 no tiene siguiente
  next_level_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'level',
  timestamps: false
});

export default Level;
