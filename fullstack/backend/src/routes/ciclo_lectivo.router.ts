import { Router } from 'express';
import { getCiclos, getCicloById, createCiclo, updateCiclo, deleteCiclo } from '../controllers/ciclo_lectivo.controller.js';

const router = Router();

router.get('/', getCiclos);
router.get('/:id', getCicloById);
router.post('/', createCiclo);
router.put('/:id', updateCiclo);
router.delete('/:id', deleteCiclo);

export default router;
