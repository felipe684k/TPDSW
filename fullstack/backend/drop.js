import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME || 'tpdsw_db', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', { host: process.env.DB_HOST || 'localhost', dialect: 'mysql', logging: false });
async function drop() {
  try {
    await sequelize.query('ALTER TABLE level DROP COLUMN fecha_desde_siguiente;');
    console.log('Column dropped successfully.');
  } catch (e) {
    if (e.message.includes("check that column/key exists")) {
      console.log('Column does not exist.');
    } else {
      console.error(e);
    }
  }
  process.exit(0);
}
drop();
