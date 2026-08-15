import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';

const router = Router();

// Routes
router.post('/login', controller.login);
router.get('/', controller.getAllUsers);
router.get('/:dni', controller.getUserByDni);
router.post('/', controller.createUser);
router.put('/:dni', controller.updateUser);
router.delete('/:dni', controller.deleteUser);

export default router;