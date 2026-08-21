import { Router } from 'express';
import { getAllPagos, getEstadoCuentaAlumno, registrarPago, getMorosos } from '../controllers/pago.controller.js';

const router = Router();

router.get('/', getAllPagos);
router.get('/morosos', getMorosos);
router.get('/alumno/:id_usuario', getEstadoCuentaAlumno);
router.post('/', registrarPago);

export default router;
