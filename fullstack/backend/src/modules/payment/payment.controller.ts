import type { Request, Response } from 'express';
import { PaymentService, PaymentError } from './payment.service.js';

const paymentService = new PaymentService();

/**
 * Obtener todos los pagos registrados
 */
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await paymentService.findAll();
    res.status(200).json({ status: 'ok', data: payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error al consultar los pagos', data: [] });
  }
};

/**
 * Obtener el estado de cuenta de un alumno por ID de usuario
 */
export const getStudentAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_user } = req.params;
    if (!id_user) {
      res.status(400).json({ status: 'error', message: 'Se requiere el ID del alumno', data: null });
      return;
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
  } catch (error: any) {
    if (error instanceof PaymentError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ status: 'error', message: error.message, data: null });
      return;
    }
    console.error('Error fetching account status:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error al consultar el estado de cuenta', data: null });
  }
};

/**
 * Registrar un nuevo pago de cuota
 */
export const registerPayment = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    if (error instanceof PaymentError || error?.statusCode) {
      res.status(error.statusCode || 400).json({ status: 'error', message: error.message, data: null });
      return;
    }
    console.error('Error registering payment:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error interno al registrar el pago', data: null });
  }
};

/**
 * Obtener listado de deudores
 */
export const getDebtors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_academic_year } = req.query;
    const debtors = await paymentService.getDebtors(
      id_academic_year ? Number(id_academic_year) : undefined
    );
    res.status(200).json({ status: 'ok', data: debtors });
  } catch (error: any) {
    console.error('Error fetching debtors:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error al consultar los deudores', data: [] });
  }
};
