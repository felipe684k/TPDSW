import express from 'express';
import { getTuitionFees, createTuitionFee } from './tuition_fee.controller.js';

const router = express.Router();

router.get('/', getTuitionFees);
router.post('/', createTuitionFee);

export default router;
