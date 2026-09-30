import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tpdsw_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false,
  }
);

// Orden respetando FK: primero las tablas hijas
const TABLES = [
  'payment',
  'enrollment',
  'section_schedule',
  'user_section',
  'section',
  'tuition_fee',
  'user_level',
  'course',
  'academic_year',
  'classroom',
  'schedule',
  'user',
  'level',
];

async function clearDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la DB.\n');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('🗑  Vaciando tablas...\n');

    for (const table of TABLES) {
      try {
        await sequelize.query(`TRUNCATE TABLE \`${table}\`;`);
        console.log(`   ✅ ${table}`);
      } catch (e) {
        console.log(`   ⚠  ${table}: ${e.message}`);
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('\n✅ DB vaciada. Los auto_increment se resetearon a 1.');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

clearDB();
