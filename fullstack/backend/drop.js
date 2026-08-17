import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('tpdsw_db', 'root', '', { host: 'localhost', dialect: 'mysql', logging: false });
async function drop() {
  try {
    await sequelize.query('ALTER TABLE nivel DROP COLUMN fecha_desde_siguiente;');
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
