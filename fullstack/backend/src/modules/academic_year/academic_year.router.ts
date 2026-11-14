import { Router } from 'express';
import { 
  getAcademicYears, 
  getAcademicYearById, 
  createAcademicYear, 
  updateAcademicYear, 
  deleteAcademicYear 
} from './academic_year.controller.js';

/**
 * ROUTER DE CICLOS LECTIVOS  (montado en /api/academic-years, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.get('/', getAcademicYears);  // listar ciclos lectivos
router.get('/:id', getAcademicYearById);  // detalle de un ciclo
router.post('/', createAcademicYear);  // crear
router.put('/:id', updateAcademicYear);  // editar
router.delete('/:id', deleteAcademicYear);  // eliminar (solo si no tiene comisiones)

export default router;
