import express, { type Request, type Response } from 'express';
import cors from 'cors';
import './config/database.js';
import userRouter from './routes/user.router.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', mensaje: 'Backend conectado correctamente 🚀' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    mensaje: '¡El Backend ahora funciona 100% con TypeScript! 🚀',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en: http://localhost:${PORT}`);
});