import express from 'express';
import { getTuitionFees, createTuitionFee } from './tuition_fee.controller.js';

/**
 * ROUTER DE ARANCELES (cuotas mensuales)  (montado en /api/tuition-fees, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = express.Router();

router.get('/', getTuitionFees);  // historial de cuotas de los cursos activos
router.post('/', createTuitionFee);  // cargar un nuevo valor de cuota para un curso

export default router;
