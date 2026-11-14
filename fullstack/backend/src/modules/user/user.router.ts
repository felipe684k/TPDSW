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

/**
 * ROUTER DE USUARIOS / ALUMNOS  (montado en /api/users, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.post('/login', login);  // iniciar sesión (admin o alumno)
router.get('/', getAllUsers);  // listar alumnos (filtros opcionales ?search=, ?level=)
router.get('/check-dni/:dni', checkStudentDni);  // busca un alumno dado de baja con ese DNI (para reactivarlo)
router.get('/:id', getUserById);  // detalle de un alumno
router.post('/', createUser);  // crear alumno (o reactivar si ya existía dado de baja)
router.put('/:id', updateUser);  // editar
router.delete('/:id', deleteUser);  // baja lógica (también da de baja sus inscripciones)

export default router;
