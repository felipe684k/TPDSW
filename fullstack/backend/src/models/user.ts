import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

//usamos sequelize para definir el modelo de la tabla usuario
export const user = sequelize.define('Usuario', {
  dni: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(75),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(75),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY, // Maneja fechas en formato YYYY-MM-DD (sin hora)
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true
  },
  usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('ALUMNO', 'PROFESOR', 'ADMIN'),
    allowNull: false
  },
  // Campo para controlar la baja lógica del usuario (true = activo / visible, false = inactivo / dado de baja)
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'usuario',
  timestamps: false
});

export default user;