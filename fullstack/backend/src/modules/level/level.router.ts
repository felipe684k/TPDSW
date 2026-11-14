import { Router } from 'express';
import { getAllLevels } from './level.controller.js';

/**
 * ROUTER DE NIVELES  (montado en /api/levels, ver app.ts)
 *
 * Solo conecta cada método HTTP + URL con su función del controller; no tiene lógica.
 * En las rutas con ":id" ese tramo de la URL llega en req.params.id (ej. PUT .../5 → req.params.id = "5").
 */
const router = Router();

router.get('/', getAllLevels);  // listar niveles (A1 a C2)

export default router;
