import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO INSCRIPCIÓN  (tabla: enrollment)
 *
 * Relaciona a un alumno con una comisión. Es una entidad propia (y no solo una tabla intermedia)
 * porque guarda datos de la cursada: fecha, estado, nota y asistencia.
 * De cada inscripción dependen los pagos de matrícula y cuotas.
 */
export const Enrollment = sequelize.define('Enrollment', {
  id_enrollment: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enrollment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Activo / Pendiente / Dado de Baja (ver ENROLLMENT_STATUS en constants.ts)
  status: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  // Nota final (0 a 10). Con 7 o más el alumno aprueba y se le agrega el nivel del curso
  final_grade: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  attendance_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  // Alumno inscripto (clave foránea a user)
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Comisión en la que se inscribió (clave foránea a section)
  id_section: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'enrollment',
  timestamps: false
});

export default Enrollment;
