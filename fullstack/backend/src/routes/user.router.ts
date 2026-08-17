import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';

const router = Router();

// Routes
router.post('/login', controller.login);
router.get('/', controller.getAllUsers);
router.get('/check-dni/:dni', controller.checkStudentDni);
router.get('/:id', controller.getUserById);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;