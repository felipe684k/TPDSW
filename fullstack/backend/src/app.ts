import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';

// Sync models with the database (creates missing tables automatically)
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database tables synchronized'))
  .catch((err) => console.error('❌ Error synchronizing tables:', err));

import userRouter from './routes/user.router.js';
import professorRouter from './routes/professor.router.js';
import levelRoutes from './routes/level.router.js';
import courseRoutes from './routes/course.router.js';
import tuitionFeeRoutes from './routes/tuition_fee.router.js';
import classroomRoutes from './routes/classroom.router.js';
import academicYearRoutes from './routes/academic_year.router.js';
import sectionRoutes from './routes/section.router.js';
import paymentRouter from './routes/payment.router.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Configure routes
app.use('/api/users', userRouter);
app.use('/api/professors', professorRouter);
app.use('/api/levels', levelRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tuition-fees', tuitionFeeRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/payments', paymentRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend connected successfully 🚀' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'The Backend now runs 100% with TypeScript! 🚀',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on: http://localhost:${PORT}`);
});
