import { Router } from 'express';
import { getAllProfessors, createProfessor, updateProfessor, deleteProfessor, checkProfessorDni } from '../controllers/professor.controller.js';

const router = Router();

router.get('/check-dni/:dni', checkProfessorDni);
router.get('/', getAllProfessors);
router.post('/', createProfessor);
router.put('/:id', updateProfessor);
router.delete('/:id', deleteProfessor);

export default router;
