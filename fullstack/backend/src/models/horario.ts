import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Horario = sequelize.define('Horario', {
  id_horario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dia: {
    type: DataTypes.ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'),
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'horario',
  timestamps: false
});

export default Horario;
