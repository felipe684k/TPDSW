import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dni: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING(75),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(75),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true
  },
  username: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('STUDENT', 'PROFESSOR', 'ADMIN'),
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'user',
  timestamps: false,
  // Por defecto nunca se lee el password (tampoco en los include de otras consultas)
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  // Solo el login y la carga inicial piden el password explícitamente
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  }
});

// Aunque el objeto tenga el password (por ejemplo, recién creado), nunca se envía en un JSON
const originalToJSON = (User as any).prototype.toJSON;
(User as any).prototype.toJSON = function () {
  const values = originalToJSON.call(this);
  delete values.password;
  return values;
};

export default User;