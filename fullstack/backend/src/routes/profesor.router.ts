import { Router } from 'express';
import { getAllProfesores, createProfesor, updateProfesor, deleteProfesor, checkProfesorDni } from '../controllers/profesor.controller.js';

const router = Router();

router.get('/check-dni/:dni', checkProfesorDni);
router.get('/', getAllProfesores);
router.post('/', createProfesor);
router.put('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);

export default router;
