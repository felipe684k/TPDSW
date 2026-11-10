import { Router } from 'express';
import {
  login,
  getAllUsers,
  checkStudentDni,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from './user.controller.js';

const router = Router();

router.post('/login', login);
router.get('/', getAllUsers);
router.get('/check-dni/:dni', checkStudentDni);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
