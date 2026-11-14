import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError.js';
import { PaymentService } from './payment.service.js';

const paymentService = new PaymentService();

/**
 * Obtener todos los pagos registrados
 */
export const getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await paymentService.findAll();
    res.status(200).json({ status: 'ok', data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener el estado de cuenta de un alumno por ID de usuario
 */
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
      res.status(200).json({
        status: 'ok',
        message: result.message,
        data: { enrollments: [], installments: [] }
      });
      return;
    }

    res.status(200).json({
      status: 'ok',
      data: {
        enrollments: result.enrollments,
        installments: result.installments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar un nuevo pago de cuota
 */
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

    res.status(201).json({
      status: 'ok',
      message: result.message,
      data: result.payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener listado de deudores
 */
export const getDebtors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id_academic_year } = req.query;
    const debtors = await paymentService.getDebtors(
      id_academic_year ? Number(id_academic_year) : undefined
    );
    res.status(200).json({ status: 'ok', data: debtors });
  } catch (error) {
    next(error);
  }
};
