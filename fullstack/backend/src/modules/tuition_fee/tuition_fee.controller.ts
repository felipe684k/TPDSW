import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response.js';
import { TuitionFeeService } from './tuition_fee.service.js';

/**
 * CONTROLLER DE ARANCELES  (/api/tuition-fees)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const tuitionFeeService = new TuitionFeeService();

// GET /api/tuition-fees → historial de cuotas de los cursos activos
export const getTuitionFees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fees = await tuitionFeeService.findAll();
    sendSuccess(res, fees, 'Aranceles obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

// POST /api/tuition-fees → carga un nuevo valor de cuota para un curso
export const createTuitionFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_course, monthly_cost, start_date } = req.body;
    const newFee = await tuitionFeeService.create({
      id_course,
      monthly_cost,
      start_date
    });
    sendSuccess(res, newFee, 'Arancel registrado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};
