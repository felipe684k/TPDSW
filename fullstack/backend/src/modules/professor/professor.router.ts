import { Router } from 'express';
import { getAllProfessors, createProfessor, updateProfessor, deleteProfessor, checkProfessorDni } from './professor.controller.js';

/**
 * ROUTER DE DOCENTES  (montado en /api/professors, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.get('/check-dni/:dni', checkProfessorDni);  // busca un docente dado de baja con ese DNI (para reactivarlo)
router.get('/', getAllProfessors);  // listar docentes
router.post('/', createProfessor);  // crear (o reactivar si ya existía dado de baja)
router.put('/:id', updateProfessor);  // editar
router.delete('/:id', deleteProfessor);  // baja lógica

export default router;
