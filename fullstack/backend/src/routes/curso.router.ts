import { Router } from 'express';
import { getAllCursos, createCurso, updateCurso, deleteCurso } from '../controllers/curso.controller.js';

const router = Router();

router.get('/', getAllCursos);
router.post('/', createCurso);
router.put('/:id', updateCurso);
router.delete('/:id', deleteCurso);

export default router;
