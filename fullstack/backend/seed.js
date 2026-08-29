import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME || 'tpdsw_db', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

const Level = sequelize.define('Level', {
  level_code: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, { tableName: 'level', timestamps: false });

async function seed() {
  try {
    await sequelize.sync();
    const levels = ['A1 — Beginner', 'A2 — Elementary', 'B1 — Intermediate', 'B2 — Upper Intermediate', 'C1 — Advanced', 'C2 — Mastery'];
    for (const name of levels) {
      const exists = await Level.findOne({ where: { name } });
      if (!exists) {
        await Level.create({ name });
        console.log(`Seeded: ${name}`);
      }
    }
    console.log('Done seeding levels');
    process.exit(0);
  } catch(e) {
    console.error('Error seeding levels:', e);
    process.exit(1);
  }
}
seed();
