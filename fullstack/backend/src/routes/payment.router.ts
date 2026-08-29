import { Router } from 'express';
import { getAllPayments, getStudentAccountStatus, registerPayment, getDebtors } from '../controllers/payment.controller.js';

const router = Router();

router.get('/', getAllPayments);
router.get('/debtors', getDebtors);
router.get('/student/:id_user', getStudentAccountStatus);
router.post('/', registerPayment);

export default router;
