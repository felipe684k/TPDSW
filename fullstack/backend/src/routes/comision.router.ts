import { Router } from 'express';
import { getComisiones, getComisionById, createComision, updateComision, deleteComision } from '../controllers/comision.controller.js';

const router = Router();

router.get('/', getComisiones);
router.get('/:id', getComisionById);
router.post('/', createComision);
router.put('/:id', updateComision);
router.delete('/:id', deleteComision);

export default router;
