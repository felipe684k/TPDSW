import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate critical environment variables or set fallbacks
const dbName = process.env.DB_NAME || 'your_database_name';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false, // Set to console.log if you want to see SQL queries
  timezone: '-03:00', // Guardar y leer fechas en hora de Argentina
  dialectOptions: {
    timezone: 'local',
  },
});

sequelize
  .authenticate()
  .then(() => console.log('✅ Conexión a MySQL exitosa'))
  .catch((err) => console.error('❌ Error al conectar:', err));
