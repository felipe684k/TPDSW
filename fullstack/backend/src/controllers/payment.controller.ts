import { type Request, type Response } from 'express';
import { Payment, Enrollment, User, Section, Course, TuitionFee } from '../models/index.js';

/**
 * Get all registered payments
 */
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Enrollment,
          as: 'enrollment',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'dni', 'email']
            },
            {
              model: Section,
              as: 'section',
              attributes: ['id_section', 'name']
            }
          ]
        }
      ],
      order: [['id_payment', 'DESC']]
    });

    res.status(200).json({ status: 'ok', data: payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error querying payments', data: [] });
  }
};

/**
 * Get the account status of a student by user ID
 */
export const getStudentAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_user } = req.params;

    // Find enrollments of the student
    const enrollments: any = await Enrollment.findAll({
      where: { id_user: id_user },
      include: [
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Course,
              as: 'course',
              include: [
                {
                  model: TuitionFee,
                  as: 'tuition_fees'
                }
              ]
            }
          ]
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    if (!enrollments || enrollments.length === 0) {
      res.status(200).json({ 
        status: 'ok', 
        message: 'The student has no registered enrollments', 
        data: { enrollments: [], installmets: [] } 
      });
      return;
    }

    // Academic months (March to December)
    const academicMonths = [
      { name: 'March', monthNum: 3 },
      { name: 'April', monthNum: 4 },
      { name: 'May', monthNum: 5 },
      { name: 'June', monthNum: 6 },
      { name: 'July', monthNum: 7 },
      { name: 'August', monthNum: 8 },
      { name: 'September', monthNum: 9 },
      { name: 'October', monthNum: 10 },
      { name: 'November', monthNum: 11 },
      { name: 'December', monthNum: 12 }
    ];

    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const installmentResults: any[] = [];

    for (const enroll of enrollments) {
      const course = enroll.section?.course;
      let baseAmount = 12000;
      if (course) {
        if (course.tuition_fees && course.tuition_fees.length > 0) {
          baseAmount = Number(course.tuition_fees[0].monthly_cost) || 12000;
        } else if (course.registration_fee) {
          baseAmount = Number(course.registration_fee) || 12000;
        }
      }

      const registeredPayments: any[] = enroll.payments || [];
      const monthsToShow = academicMonths.filter(m => m.monthNum <= currentMonthNum || registeredPayments.some(p => p.installment_month?.toLowerCase() === m.name.toLowerCase()));

      monthsToShow.forEach((m) => {
        const existingPayment = registeredPayments.find(p => p.installment_month?.toLowerCase() === m.name.toLowerCase());
        const dueDate = `10/${m.monthNum.toString().padStart(2, '0')}/${currentYear}`;

        if (existingPayment) {
          installmentResults.push({
            id: existingPayment.id_payment,
            id_enrollment: enroll.id_enrollment,
            section: enroll.section?.name || 'Section',
            installment_month: m.name,
            amount: Number(existingPayment.amount),
            due_date: dueDate,
            status: existingPayment.status || 'Paid',
            payment_date: existingPayment.payment_date,
            surcharge: Number(existingPayment.surcharge || 0),
            discount: Number(existingPayment.discount || 0)
          });
        } else {
          installmentResults.push({
            id: `pending_${enroll.id_enrollment}_${m.monthNum}`,
            id_enrollment: enroll.id_enrollment,
            section: enroll.section?.name || 'Section',
            installment_month: m.name,
            amount: baseAmount,
            due_date: dueDate,
            status: 'Pending',
            payment_date: null,
            surcharge: 0,
            discount: 0
          });
        }
      });
    }

    res.status(200).json({ status: 'ok', data: { enrollments, installments: installmentResults } });
  } catch (error: any) {
    console.error('Error fetching account status:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error querying account status', data: null });
  }
};

/**
 * Register a new tuition payment
 */
export const registerPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_enrollment, installment_month, amount, surcharge, discount, status, payment_date } = req.body;

    const numEnrollmentId = typeof id_enrollment === 'number' ? id_enrollment : parseInt(id_enrollment, 10);

    if (!numEnrollmentId || isNaN(numEnrollmentId)) {
      res.status(400).json({ 
        status: 'error', 
        message: 'A valid previous enrollment is required to register a payment.', 
        data: null 
      });
      return;
    }

    // Validate that enrollment exists
    const existingEnrollment = await Enrollment.findByPk(numEnrollmentId);
    if (!existingEnrollment) {
      res.status(404).json({ 
        status: 'error', 
        message: 'The specified enrollment was not found in the database.', 
        data: null 
      });
      return;
    }

    if (!installment_month || amount === undefined) {
      res.status(400).json({ status: 'error', message: 'Missing required fields (installment_month, amount)', data: null });
      return;
    }

    const actualDate = payment_date || new Date().toISOString().split('T')[0];
    const actualStatus = status || 'Paid';

    // Check if payment already exists for this enrollment and month
    const existingPayment: any = await Payment.findOne({
      where: {
        id_enrollment: numEnrollmentId,
        installment_month
      }
    });

    if (existingPayment) {
      // Update existing record
      await existingPayment.update({
        payment_date: actualDate,
        amount: Number(amount),
        surcharge: Number(surcharge || 0),
        discount: Number(discount || 0),
        status: actualStatus
      });

      res.status(200).json({ status: 'ok', message: 'Payment updated successfully', data: existingPayment });
      return;
    }

    // Create new payment
    const newPayment = await Payment.create({
      id_enrollment: numEnrollmentId,
      payment_date: actualDate,
      amount: Number(amount),
      surcharge: Number(surcharge || 0),
      discount: Number(discount || 0),
      status: actualStatus,
      installment_month
    });

    res.status(201).json({ status: 'ok', message: 'Payment registered successfully', data: newPayment });
  } catch (error: any) {
    console.error('Error registering payment:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error registering payment', data: null });
  }
};

/**
 * Get list of debtors
 */
export const getDebtors = async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments: any = await Enrollment.findAll({
      where: { status: 'Active' },
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'STUDENT', active: true }
        },
        {
          model: Section,
          as: 'section'
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    const debtorsMap = new Map();
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;

    const academicMonths = [
      { name: 'March', monthNum: 3 },
      { name: 'April', monthNum: 4 },
      { name: 'May', monthNum: 5 },
      { name: 'June', monthNum: 6 },
      { name: 'July', monthNum: 7 },
      { name: 'August', monthNum: 8 },
      { name: 'September', monthNum: 9 },
      { name: 'October', monthNum: 10 },
      { name: 'November', monthNum: 11 },
      { name: 'December', monthNum: 12 }
    ];

    const dueMonths = academicMonths.filter(m => m.monthNum <= currentMonthNum);

    for (const enroll of enrollments) {
      const userObj = enroll.user;
      if (!userObj) continue;

      const payments: any[] = enroll.payments || [];
      const unpaidInstallments: string[] = [];
      let totalDebt = 0;

      for (const m of dueMonths) {
        const paid = payments.some(p => p.installment_month?.toLowerCase() === m.name.toLowerCase() && p.status === 'Paid');
        if (!paid) {
          unpaidInstallments.push(m.name);
          totalDebt += 12000;
        }
      }

      if (unpaidInstallments.length > 0) {
        debtorsMap.set(userObj.id, {
          id: userObj.id,
          fullName: `${userObj.last_name}, ${userObj.first_name}`,
          dni: userObj.dni,
          course: enroll.section?.name || 'General Course',
          unpaidInstallments: unpaidInstallments.length,
          totalDebt
        });
      }
    }

    res.status(200).json({ status: 'ok', data: Array.from(debtorsMap.values()) });
  } catch (error: any) {
    console.error('Error fetching debtors:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Error querying debtors', data: [] });
  }
};
