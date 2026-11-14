import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Al dar de baja un usuario, a su DNI, email y username se les agrega "_deleted_<timestamp>" en la base
 * para liberar los índices únicos (así se puede registrar otra persona con esos datos).
 * Ese sufijo es solo interno: al leer el valor se devuelve limpio, para que en los listados históricos
 * (inscripciones, pagos) se vea el DNI real. Las búsquedas en la base no se ven afectadas.
 */
export function stripDeletedSuffix(value: string | null | undefined): string | null | undefined {
  return typeof value === 'string' ? value.replace(/_deleted_\d+$/, '') : value;
}

/**
 * MODELO USUARIO  (tabla: user)
 *
 * Una sola tabla para todas las personas del sistema; el campo role dice qué es cada una:
 *   - ADMIN: Secretaría, administra todo.
 *   - STUDENT: alumno, puede entrar a ver sus cursadas y su estado de cuenta.
 *   - PROFESSOR: docente, se asigna a comisiones pero no puede iniciar sesión.
 * Tener una sola tabla permite controlar que un DNI o email no se repita entre alumnos y docentes.
 */
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // get(): se ejecuta al leer el valor; acá devuelve el DNI sin el sufijo "_deleted_..."
  dni: {
    type: DataTypes.STRING(50),
    allowNull: false,
    get() { return stripDeletedSuffix(this.getDataValue('dni')); }
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
    get() { return stripDeletedSuffix(this.getDataValue('email')); }
  },
  username: {
    type: DataTypes.STRING(150),
    allowNull: false,
    get() { return stripDeletedSuffix(this.getDataValue('username')); }
  },
  // Siempre se guarda encriptada con bcrypt (nunca en texto plano)
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('STUDENT', 'PROFESSOR', 'ADMIN'),
    allowNull: false
  },
  // Baja lógica: al dar de baja se pone en false (se conserva el historial)
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'user',
  timestamps: false,
  // DNI, email y username no se pueden repetir. Los índices únicos se declaran acá con un nombre fijo
  // (y no con "unique: true" en cada columna) porque sequelize.sync({ alter: true }) no reconoce los
  // índices sin nombre y crea una copia nueva en cada arranque (dni_2, dni_3...) hasta llegar al límite
  // de 64 índices de MySQL. Con nombre fijo, ve que ya existen y no los duplica.
  indexes: [
    { name: 'user_dni_unique', unique: true, fields: ['dni'] },
    { name: 'user_email_unique', unique: true, fields: ['email'] },
    { name: 'user_username_unique', unique: true, fields: ['username'] }
  ],
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