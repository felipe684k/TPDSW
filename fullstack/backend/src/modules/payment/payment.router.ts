import { Router } from 'express';
import { getAllPayments, getStudentAccountStatus, registerPayment, getDebtors } from './payment.controller.js';

/**
 * ROUTER DE PAGOS  (montado en /api/payments, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 *
 * Caso de uso 4: registrar pagos de cuotas y reporte de deudores.
 */
const router = Router();

router.get('/', getAllPayments);  // listar todos los pagos
router.get('/debtors', getDebtors);  // reporte de alumnos con deuda
router.get('/student/:id_user', getStudentAccountStatus);  // estado de cuenta de un alumno (matrícula y cuotas)
router.post('/', registerPayment);  // registrar un pago (total o parcial)

export default router;
