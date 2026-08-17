import { Router } from 'express';
import { getAllNiveles } from '../controllers/nivel.controller.js';

const router = Router();

router.get('/', getAllNiveles);

export default router;
