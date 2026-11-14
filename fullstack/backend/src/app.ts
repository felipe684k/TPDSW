/**
 * PUNTO DE ENTRADA DEL BACKEND
 *
 * Este archivo arma y levanta el servidor Express. En orden:
 *   1. Conecta con MySQL, sincroniza las tablas y carga los datos iniciales (initDatabase).
 *   2. Registra los middlewares globales (cors y express.json).
 *   3. Monta un router por cada módulo bajo /api/...
 *   4. Agrega el 404 para rutas inexistentes y el middleware de errores (siempre al final).
 *   5. Empieza a escuchar pedidos en el puerto configurado.
 *
 * Recorrido de un pedido: router → controller → service → modelo (Sequelize) → MySQL.
 */
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { sequelize, User, Level } from './models/index.js';
import { errorHandler, isDatabaseConnectionError, DB_UNAVAILABLE_MESSAGE } from './middlewares/errorHandler.js';
import { AppError } from './errors/AppError.js';

// ─── DATOS INICIALES ────────────────────────────────────────────────────────

/**
 * Crea los usuarios de demo si no existen: admin (Secretaría) y user (alumno), ambos con clave 12345.
 * Si ya existen pero su clave quedó guardada en texto plano (versiones viejas), la pasa a hash con bcrypt.
 */
async function seedDefaultUsers() {
  try {
    // 1. Usuario administrador
    const admin: any = await User.scope('withPassword').findOne({ where: { username: 'admin' } });
    if (!admin) {
      const adminPasswordHash = await bcrypt.hash('12345', 10);
      await User.create({
        dni: '00000000',
        first_name: 'Secretaría',
        last_name: 'Administración',
        email: 'admin@instituto.com',
        username: 'admin',
        password: adminPasswordHash,
        role: 'ADMIN',
        active: true
      });
      console.log('👤 Usuario admin inicial creado (admin / 12345)');
    } else if (typeof admin.password === 'string' && !admin.password.startsWith('$2')) {
      // Los hash de bcrypt empiezan con "$2": si no, la clave está en texto plano
      const adminPasswordHash = await bcrypt.hash('12345', 10);
      await admin.update({ password: adminPasswordHash });
      console.log('🔑 Contraseña de admin actualizada a hash');
    }

    // 2. Usuario alumno de demo
    const student: any = await User.scope('withPassword').findOne({ where: { username: 'user' } });
    if (!student) {
      const studentPasswordHash = await bcrypt.hash('12345', 10);
      await User.create({
        dni: '11223344',
        first_name: 'Alumno',
        last_name: 'Prueba',
        email: 'user@instituto.com',
        username: 'user',
        password: studentPasswordHash,
        role: 'STUDENT',
        active: true
      });
      console.log('👤 Usuario estudiante inicial creado (user / 12345)');
    } else if (typeof student.password === 'string' && !student.password.startsWith('$2')) {
      const studentPasswordHash = await bcrypt.hash('12345', 10);
      await student.update({ password: studentPasswordHash });
      console.log('🔑 Contraseña de estudiante actualizada a hash');
    }
  } catch (error) {
    console.error('❌ Error inicializando usuarios por defecto:', error);
  }
}

/**
 * Si la tabla de niveles está vacía, crea A1 → A2 → B1 → B2 → C1 → C2
 * y encadena cada uno con el siguiente (next_level_code), que es lo que usa la promoción de nivel.
 */
async function seedDefaultLevels() {
  try {
    const count = await Level.count();
    if (count === 0) {
      const levelsData = ['A1 - Principiante', 'A2 - Elemental', 'B1 - Intermedio', 'B2 - Intermedio Alto', 'C1 - Avanzado', 'C2 - Maestria'];
      const createdLevels: any[] = [];
      for (const name of levelsData) {
        const level: any = await Level.create({ name });
        createdLevels.push(level);
      }
      // Cada nivel apunta al siguiente; C2 queda sin siguiente (es el último)
      for (let i = 0; i < createdLevels.length - 1; i++) {
        await createdLevels[i].update({ next_level_code: createdLevels[i + 1].level_code });
      }
      console.log('📚 Niveles iniciales creados exitosamente');
    }
  } catch (error) {
    console.error('❌ Error inicializando niveles:', error);
  }
}

// ─── CONEXIÓN Y SINCRONIZACIÓN CON LA BASE ──────────────────────────────────

// Si MySQL todavía no está disponible (por ejemplo, el backend arrancó antes que el gestor),
// se reintenta cada 5 segundos.
const DB_RETRY_MS = 5000;

/**
 * Borra índices viejos duplicados de la tabla user. Versiones anteriores del modelo creaban
 * un índice nuevo en cada arranque; se dejan solo la clave primaria y los 3 índices únicos con nombre.
 */
async function cleanupLegacyIndexes(): Promise<void> {
  try {
    const keepUserIndexes = new Set(['PRIMARY', 'user_dni_unique', 'user_email_unique', 'user_username_unique']);
    const [rows]: any = await sequelize.query('SHOW INDEX FROM `user`');
    const toDrop = new Set<string>();
    for (const row of rows || []) {
      if (row.Key_name && !keepUserIndexes.has(row.Key_name)) {
        toDrop.add(row.Key_name);
      }
    }
    for (const indexName of toDrop) {
      await sequelize.query(`ALTER TABLE \`user\` DROP INDEX \`${indexName}\``);
    }
  } catch {
    // La tabla todavía no existe o ya está limpia
  }
}

/**
 * Prepara la base: limpia índices viejos, crea o actualiza las tablas según los modelos
 * (sync con alter) y carga los datos iniciales.
 * Si la base no responde, no corta el servidor: vuelve a intentar en 5 segundos.
 */
async function initDatabase(attempt = 1): Promise<void> {
  try {
    await cleanupLegacyIndexes();
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
    await seedDefaultUsers();
    await seedDefaultLevels();
  } catch (err: any) {
    if (isDatabaseConnectionError(err)) {
      console.error(`⏳ Base de datos no disponible (intento ${attempt}). Reintentando en ${DB_RETRY_MS / 1000} s...`);
      setTimeout(() => initDatabase(attempt + 1), DB_RETRY_MS);
      return;
    }
    console.error('❌ Error synchronizing tables:', err);
  }
}

// Se llama sin await: el servidor sigue arrancando mientras la base se prepara
initDatabase();

// ─── SERVIDOR EXPRESS ───────────────────────────────────────────────────────

import userRouter from './modules/user/user.router.js';
import professorRouter from './modules/professor/professor.router.js';
import levelRoutes from './modules/level/level.router.js';
import courseRoutes from './modules/course/course.router.js';
import enrollmentRoutes from './modules/enrollment/enrollment.router.js';
import tuitionFeeRoutes from './modules/tuition_fee/tuition_fee.router.js';
import classroomRoutes from './modules/classroom/classroom.router.js';
import academicYearRoutes from './modules/academic_year/academic_year.router.js';
import sectionRoutes from './modules/section/section.router.js';
import paymentRouter from './modules/payment/payment.router.js';

const app = express();
// Puerto del servidor: se toma del .env (PORT) y, si no está definido, se usa 3000
const PORT = Number(process.env.PORT) || 3000;

// Middlewares globales: se ejecutan en este orden para todos los pedidos
app.use(cors());          // permite que el front (otro puerto) le haga pedidos a esta API
app.use(express.json());  // convierte el body JSON del pedido en un objeto (req.body)

// Rutas: cada módulo tiene su router; acá se define el prefijo de URL de cada uno
app.use('/api/users', userRouter);
app.use('/api/professors', professorRouter);
app.use('/api/levels', levelRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/tuition-fees', tuitionFeeRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/payments', paymentRouter);

// Health check: además de responder, verifica que la base de datos esté disponible.
// El front lo consulta cada 5 segundos para mostrar el cartel de conexión.
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'up', message: 'Backend y base de datos funcionando 🚀' });
  } catch {
    res.status(503).json({ status: 'db_unavailable', database: 'down', message: DB_UNAVAILABLE_MESSAGE });
  }
});

// Ruta raíz: solo confirma que el servidor está prendido
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'The Backend now runs 100% with TypeScript! 🚀',
  });
});

// Si ninguna ruta anterior respondió, la ruta no existe: se deriva un 404 al errorHandler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`La ruta ${req.method} ${req.originalUrl} no existe`, 404));
});

// Middleware global de errores: siempre va después de todas las rutas
app.use(errorHandler);

// '0.0.0.0' permite conectarse también desde otras máquinas de la red, no solo desde localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on: http://localhost:${PORT}`);
});
