import { Router } from 'express';
import { getAulas, createAula, updateAula } from '../controllers/aula.controller.js';

const router = Router();

router.get('/', getAulas);
router.post('/', createAula);
router.put('/:id', updateAula);

export default router;
