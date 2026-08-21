import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME || 'tpdsw_db', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

const Nivel = sequelize.define('Nivel', {
  codigo_nivel: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, { tableName: 'nivel', timestamps: false });

async function seed() {
  try {
    await sequelize.sync();
    const niveles = ['A1 — Principiante', 'A2 — Elemental', 'B1 — Intermedio', 'B2 — Intermedio Alto', 'C1 — Avanzado', 'C2 — Maestría'];
    for (const nombre of niveles) {
      const exists = await Nivel.findOne({ where: { nombre } });
      if (!exists) {
        await Nivel.create({ nombre });
        console.log(`Seeded: ${nombre}`);
      }
    }
    console.log('Done seeding niveles');
    process.exit(0);
  } catch(e) {
    console.error('Error seeding niveles:', e);
    process.exit(1);
  }
}
seed();
