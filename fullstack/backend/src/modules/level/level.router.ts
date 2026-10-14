import { Router } from 'express';
import { getAllLevels } from './level.controller.js';

const router = Router();

router.get('/', getAllLevels);

export default router;
