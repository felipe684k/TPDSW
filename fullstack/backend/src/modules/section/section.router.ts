import { Router } from 'express';
import { getSections, getSectionById, createSection, updateSection, deleteSection } from './section.controller.js';

/**
 * ROUTER DE COMISIONES  (montado en /api/sections, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 *
 * Caso de uso 1: crear y editar comisiones validando que aula y docente no se superpongan.
 */
const router = Router();

router.get('/', getSections);  // listar comisiones (filtros opcionales ?level=, ?id_course=, ?id_academic_year=)
router.get('/:id', getSectionById);  // detalle de una comisión
router.post('/', createSection);  // crear
router.put('/:id', updateSection);  // editar
router.delete('/:id', deleteSection);  // eliminar (solo si no tiene alumnos inscriptos)

export default router;
