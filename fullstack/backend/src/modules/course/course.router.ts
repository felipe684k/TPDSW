import { Router } from 'express';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from './course.controller.js';

/**
 * ROUTER DE CURSOS  (montado en /api/courses, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.get('/', getAllCourses);  // listar cursos activos (filtro opcional ?level=)
router.post('/', createCourse);  // crear curso con su cuota inicial
router.put('/:id', updateCourse);  // editar
router.delete('/:id', deleteCourse);  // baja lógica (solo si no tiene comisiones)

export default router;
