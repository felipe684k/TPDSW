import { Router } from 'express';
import { getAllProfesores, createProfesor, updateProfesor, deleteProfesor } from '../controllers/profesor.controller.js';

const router = Router();

router.get('/', getAllProfesores);
router.post('/', createProfesor);
router.put('/:dni', updateProfesor);
router.delete('/:dni', deleteProfesor);

export default router;
