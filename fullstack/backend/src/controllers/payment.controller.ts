import { type Request, type Response } from 'express';
import * as paymentService from '../services/payment.service.js';

/**
 * Get all registered payments
 */
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await paymentService.getAllPaymentsService();
    res.status(200).json({ status: 'ok', data: payments });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Error querying payments';
    console.error('Error fetching payments:', error?.message || error);
    res.status(status).json({ status: status === 500 ? 'db_error' : 'error', message, data: [] });
  }
};

/**
 * Get the account status of a student by user ID, optionally filtered by academic year
 */
export const getStudentAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_user } = req.params;
    const { id_academic_year } = req.query;

    const data = await paymentService.getStudentAccountStatusService(id_user, id_academic_year as string);
    if (!data.enrollments || data.enrollments.length === 0) {
      res.status(200).json({ 
        status: 'ok', 
        message: 'The student has no registered enrollments for this academic period', 
        data: { enrollments: [], installments: [] } 
      });
      return;
    }

    res.status(200).json({ status: 'ok', data });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Error querying account status';
    console.error('Error fetching account status:', error?.message || error);
    res.status(status).json({ status: status === 500 ? 'db_error' : 'error', message, data: null });
  }
};

/**
 * Register a new tuition payment (supports partial / fragmented payments)
 */
export const registerPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await paymentService.registerPaymentService(req.body);
    const { newPayment, newStatus, payAmount, baseAmount, newTotalPaid } = result;
    
    res.status(201).json({ 
      status: 'ok', 
      message: newStatus === 'Paid' 
        ? 'Cuota saldada exitosamente' 
        : `Pago parcial de $${payAmount} registrado. Saldo pendiente: $${baseAmount - newTotalPaid}`, 
      data: newPayment 
    });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal error registering payment';
    console.error('Error registering payment:', error?.message || error);
    res.status(status).json({ status: status === 500 ? 'db_error' : 'error', message, data: null });
  }
};

/**
 * Get list of debtors
 */
export const getDebtors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_academic_year } = req.query;
    const debtors = await paymentService.getDebtorsService(id_academic_year as string);
    res.status(200).json({ status: 'ok', data: debtors });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Error querying debtors';
    console.error('Error fetching debtors:', error?.message || error);
    res.status(status).json({ status: status === 500 ? 'db_error' : 'error', message, data: [] });
  }
};
