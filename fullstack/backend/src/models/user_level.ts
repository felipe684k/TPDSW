import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO ALUMNO-NIVEL  (tabla: user_level)
 *
 * Historial de niveles aprobados por cada alumno (relación muchos a muchos entre user y level).
 * El nivel actual es el más reciente (ver CURRENT_LEVEL_ORDER en models/index.ts).
 */
export const UserLevel = sequelize.define('UserLevel', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  level_code: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  // Fecha en que el alumno obtuvo el nivel
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'user_level',
  timestamps: false
});

export default UserLevel;
