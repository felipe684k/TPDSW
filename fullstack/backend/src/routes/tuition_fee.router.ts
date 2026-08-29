import express from 'express';
import { getTuitionFees, createTuitionFee } from '../controllers/tuition_fee.controller.js';

const router = express.Router();

router.get('/', getTuitionFees);
router.post('/', createTuitionFee);

export default router;
