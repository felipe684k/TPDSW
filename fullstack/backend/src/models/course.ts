import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * MODELO CURSO  (tabla: course)
 *
 * Lo que se enseña (ej. "Inglés A1 Adultos"). Pertenece a un nivel y tiene matrícula y cuotas.
 * Los alumnos no se inscriben al curso sino a una de sus comisiones.
 */
export const Course = sequelize.define('Course', {
  id_course: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  course_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  // Matrícula: se cobra una vez al inscribirse. DECIMAL(10, 2) = hasta 10 dígitos, 2 decimales
  registration_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // Nivel del curso (clave foránea a level)
  level_code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Carga horaria semanal (opcional)
  weekly_hours: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  // Baja lógica: al "borrar" un curso se pone en false en vez de eliminar la fila
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'course',
  timestamps: false
});

export default Course;
