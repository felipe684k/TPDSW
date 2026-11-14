import { Router } from 'express';
import { getAllEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from './enrollment.controller.js';

/**
 * ROUTER DE INSCRIPCIONES  (montado en /api/enrollments, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.get('/', getAllEnrollments);  // listar inscripciones (filtro opcional ?id_section=)
router.post('/', createEnrollment);  // inscribir alumno a una comisión (CUU 2)
router.put('/:id', updateEnrollment);  // editar: nota, asistencia y estado (CUU 3: promoción de nivel)
router.delete('/:id', deleteEnrollment);  // dar de baja la inscripción (cambia el estado, no la borra)

export default router;
