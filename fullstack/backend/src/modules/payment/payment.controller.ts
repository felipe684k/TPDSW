import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError.js';
import { sendSuccess } from '../../utils/response.js';
import { PaymentService } from './payment.service.js';

/**
 * CONTROLLER DE PAGOS  (/api/payments)
 *
 * Capa HTTP: cada función recibe el pedido (req), toma los datos que necesita
 * (req.body, req.params, req.query), llama al service y arma la respuesta (res).
 * No tiene reglas de negocio: esas están en el service.
 * Si algo falla, el catch deriva el error al middleware de errores con next(error).
 */
const paymentService = new PaymentService();

// GET /api/payments → lista todos los pagos registrados
export const getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await paymentService.findAll();
    sendSuccess(res, payments, 'Pagos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/student/:id_user?id_academic_year= → estado de cuenta de un alumno
export const getStudentAccountStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_user } = req.params;
    if (!id_user) {
      throw new AppError('Se requiere el ID del alumno', 400);
    }

    const { id_academic_year } = req.query;

    const result = await paymentService.getStudentAccountStatus(
      id_user as string,
      id_academic_year ? Number(id_academic_year) : undefined
    );

    if (result.enrollments.length === 0 && result.message) {
      sendSuccess(res, { enrollments: [], installments: [] }, result.message);
      return;
    }

    sendSuccess(
      res,
      {
        enrollments: result.enrollments,
        installments: result.installments
      },
      'Estado de cuenta obtenido exitosamente'
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/payments → registra el pago (total o parcial) de una cuota o de la matrícula
export const registerPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_enrollment, installment_month, amount, payment_method, payment_date } = req.body;

    const result = await paymentService.registerPayment({
      id_enrollment,
      installment_month,
      amount,
      payment_method,
      payment_date
    });

    sendSuccess(res, result.payment, result.message, 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/debtors?id_academic_year= → reporte de alumnos con cuotas vencidas sin pagar
export const getDebtors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_academic_year } = req.query;
    const debtors = await paymentService.getDebtors(
      id_academic_year ? Number(id_academic_year) : undefined
    );
    sendSuccess(res, debtors, 'Reporte de deudores obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};
