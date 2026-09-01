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
  },
  next_level_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, { tableName: 'level', timestamps: false });

async function seed() {
  try {
    await sequelize.sync();
    const levelsData = ['A1 - Principiante', 'A2 - Elemental', 'B1 - Intermedio', 'B2 - Intermedio Alto', 'C1 - Avanzado', 'C2 - Maestria'];
    const createdLevels = [];
    
    for (const name of levelsData) {
      let level = await Level.findOne({ where: { name } });
      if (!level) {
        level = await Level.create({ name });
        console.log(`Seeded: ${name}`);
      }
      createdLevels.push(level);
    }
    
    for (let i = 0; i < createdLevels.length - 1; i++) {
      await createdLevels[i].update({ next_level_code: createdLevels[i + 1].level_code });
    }
    
    console.log('Done seeding levels with next_level_code');
    process.exit(0);
  } catch(e) {
    console.error('Error seeding levels:', e);
    process.exit(1);
  }
}
seed();
