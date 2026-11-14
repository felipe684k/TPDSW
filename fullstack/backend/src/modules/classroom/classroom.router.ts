import { Router } from 'express';
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from './classroom.controller.js';

/**
 * ROUTER DE AULAS  (montado en /api/classrooms, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.get('/', getClassrooms);  // listar aulas
router.post('/', createClassroom);  // crear
router.put('/:id', updateClassroom);  // editar
router.delete('/:id', deleteClassroom);  // eliminar (solo si no tiene comisiones)

export default router;