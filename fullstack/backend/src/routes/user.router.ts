import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';

const router = Router();

// Routes
router.get('/', controller.getAllUsers);
router.get('/:dni', controller.getUserByDni);

export default router;