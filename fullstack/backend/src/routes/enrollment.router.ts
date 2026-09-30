import { Router } from 'express';
import { getAllEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '../controllers/enrollment.controller.js';

const router = Router();

router.get('/', getAllEnrollments);
router.post('/', createEnrollment);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

export default router;