import { Router } from 'express';
import { getAcademicYears, getAcademicYearById, createAcademicYear, updateAcademicYear, deleteAcademicYear } from '../controllers/academic_year.controller.js';

const router = Router();

router.get('/', getAcademicYears);
router.get('/:id', getAcademicYearById);
router.post('/', createAcademicYear);
router.put('/:id', updateAcademicYear);
router.delete('/:id', deleteAcademicYear);

export default router;
