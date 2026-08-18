import express from 'express';
import { getValoresCuota, createValorCuota } from '../controllers/valor_cuota.controller.js';

const router = express.Router();

router.get('/', getValoresCuota);
router.post('/', createValorCuota);

export default router;
