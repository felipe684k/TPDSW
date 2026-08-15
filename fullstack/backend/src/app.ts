import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';

// Sincronizar modelos con la base de datos (crea las tablas que falten automáticamente)
sequelize.sync()
  .then(() => console.log('✅ Tablas de la base de datos sincronizadas'))
  .catch((err) => console.error('❌ Error sincronizando tablas:', err));
import userRouter from './routes/user.router.js';
import profesorRouter from './routes/profesor.router.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/profesores', profesorRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', mensaje: 'Backend conectado correctamente 🚀' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    mensaje: '¡El Backend ahora funciona 100% con TypeScript! 🚀',
  });
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor backend corriendo en: http://localhost:${PORT}`);
});