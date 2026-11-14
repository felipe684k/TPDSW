/**
 * CONEXIÓN CON LA BASE DE DATOS
 *
 * Crea la instancia de Sequelize (el ORM) que usan todos los modelos para hablar con MySQL.
 * Los datos de conexión salen del archivo .env (ver .env.example).
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carga las variables del archivo .env en process.env
dotenv.config();

// Datos de conexión; si alguna variable falta en el .env se usa el valor por defecto
const dbName = process.env.DB_NAME || 'your_database_name';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false, // poner console.log para ver en la terminal el SQL que genera Sequelize
  timezone: '-03:00', // las fechas se leen y se guardan en hora argentina
  dialectOptions: {
    timezone: 'local',
  },
});

// Prueba la conexión al arrancar y lo informa en la terminal (no corta el servidor si falla)
sequelize
  .authenticate()
  .then(() => console.log('✅ MySQL connection successful'))
  .catch((err) => console.error('❌ Database connection error:', err));

