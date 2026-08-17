import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize('tpdsw_db', 'root', '', {
  host: 'localhost',
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
    const niveles = ['A1 — Principiante', 'A2 — Elemental', 'B1 — Intermedio', 'B2 — Intermedio Alto', 'C1 — Avanzado', 'C2 — Maestría'];
    for (const nombre of niveles) {
      const exists = await Nivel.findOne({ where: { nombre } });
      if (!exists) {
        await Nivel.create({ nombre });
        console.log(`Seeded: ${nombre}`);
      }
    }
    console.log('Done seeding niveles');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
seed();
