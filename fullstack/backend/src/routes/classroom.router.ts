import { Router } from 'express';
import { getClassrooms, createClassroom, updateClassroom } from '../controllers/classroom.controller.js';

const router = Router();

router.get('/', getClassrooms);
router.post('/', createClassroom);
router.put('/:id', updateClassroom);

export default router;
