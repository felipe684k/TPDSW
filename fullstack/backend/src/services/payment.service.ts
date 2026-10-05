import { Payment, Enrollment, User, Section, Course, TuitionFee, AcademicYear } from '../models/index.js';

export const getAllPaymentsService = async () => {
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
            include: [
              { model: AcademicYear, as: 'academic_year' },
              { model: Course, as: 'course' }
            ],
            attributes: ['id_section', 'name']
          }
        ]
      }
    ],
    order: [['id_payment', 'DESC']]
  });
  return payments;
};

export const getStudentAccountStatusService = async (id_user: string, id_academic_year?: string) => {
  const sectionWhere: any = {};
  if (id_academic_year) {
    sectionWhere.id_academic_year = Number(id_academic_year);
  }

  // Find enrollments of the student
  const enrollments: any = await Enrollment.findAll({
    where: { id_user: id_user },
    include: [
      {
        model: Section,
        as: 'section',
        where: Object.keys(sectionWhere).length > 0 ? sectionWhere : undefined,
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
          },
          {
            model: AcademicYear,
            as: 'academic_year'
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
    return { enrollments: [], installments: [] };
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
    const ay = enroll.section?.academic_year;
    const ayName = ay?.name || 'Ciclo Lectivo';
    const ayYear = ay?.start_date 
      ? new Date(ay.start_date).getFullYear() 
      : (ay?.name?.match(/\d{4}/) ? parseInt(ay.name.match(/\d{4}/)![0], 10) : currentYear);
    
    const isPastYear = ayYear < currentYear;
    const isFutureYear = ayYear > currentYear;

    let baseAmount = 12000;
    if (course) {
      if (course.tuition_fees && course.tuition_fees.length > 0) {
        baseAmount = Number(course.tuition_fees[0].monthly_cost) || 12000;
      } else if (course.registration_fee) {
        baseAmount = Number(course.registration_fee) || 12000;
      }
    }

    const registeredPayments: any[] = enroll.payments || [];
    
    // Determine which months are due / displayed:
    // If it's a past academic year (e.g. 2025): ALL academic months (3 to 12) are due!
    // If it's the current year: months up to current month (or any month with a payment).
    // If it's a future year: only months that have registered payments.
    const monthsToShow = isPastYear
      ? academicMonths
      : isFutureYear
      ? academicMonths.filter(m => registeredPayments.some(p => p.installment_month?.toLowerCase() === m.name.toLowerCase()))
      : academicMonths.filter(m => 
          m.monthNum <= currentMonthNum || 
          registeredPayments.some(p => p.installment_month?.toLowerCase() === m.name.toLowerCase())
        );

    monthsToShow.forEach((m) => {
      const monthPayments = registeredPayments.filter(
        p => p.installment_month?.toLowerCase() === m.name.toLowerCase()
      );
      const totalPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const remainingAmount = Math.max(0, baseAmount - totalPaid);
      const dueDate = `10/${m.monthNum.toString().padStart(2, '0')}/${ayYear}`;

      let status = 'Pending';
      if (totalPaid >= baseAmount) {
        status = 'Paid';
      } else if (totalPaid > 0) {
        status = 'Partial';
      }

      const lastPayment = monthPayments.length > 0 ? monthPayments[monthPayments.length - 1] : null;

      installmentResults.push({
        id: lastPayment ? lastPayment.id_payment : `pending_${enroll.id_enrollment}_${m.monthNum}`,
        id_enrollment: enroll.id_enrollment,
        id_course: course?.id_course,
        course_name: course?.course_name || 'Curso',
        section: enroll.section?.name || 'Section',
        id_academic_year: ay?.id_academic_year,
        academic_year_name: ayName,
        year: ayYear,
        installment_month: m.name,
        amount: baseAmount,
        total_paid: totalPaid,
        remaining_amount: remainingAmount,
        due_date: dueDate,
        status: status,
        payment_date: lastPayment ? lastPayment.payment_date : null,
        payment_method: lastPayment ? lastPayment.payment_method : null,
        payments: monthPayments.map(p => ({
          id: p.id_payment,
          amount: Number(p.amount),
          payment_date: p.payment_date,
          payment_method: p.payment_method,
          status: p.status
        }))
      });
    });
  }

  return { enrollments, installments: installmentResults };
};

export const registerPaymentService = async (data: any) => {
  const { id_enrollment, installment_month, amount, payment_method, payment_date } = data;

  const numEnrollmentId = typeof id_enrollment === 'number' ? id_enrollment : parseInt(id_enrollment, 10);

  if (!numEnrollmentId || isNaN(numEnrollmentId)) {
    throw { status: 400, message: 'A valid previous enrollment is required to register a payment.' };
  }

  // Validate that enrollment exists with course tuition fee info and past payments
  const existingEnrollment: any = await Enrollment.findByPk(numEnrollmentId, {
    include: [
      {
        model: Section,
        as: 'section',
        include: [
          {
            model: Course,
            as: 'course',
            include: [{ model: TuitionFee, as: 'tuition_fees' }]
          },
          {
            model: AcademicYear,
            as: 'academic_year'
          }
        ]
      },
      {
        model: Payment,
        as: 'payments'
      }
    ]
  });

  if (!existingEnrollment) {
    throw { status: 404, message: 'The specified enrollment was not found in the database.' };
  }

  const payAmount = Number(amount);
  if (!installment_month || isNaN(payAmount) || payAmount <= 0) {
    throw { status: 400, message: 'Monto y mes de cuota válidos son requeridos.' };
  }

  // Determine base amount for the month
  const course = existingEnrollment.section?.course;
  let baseAmount = 12000;
  if (course) {
    if (course.tuition_fees && course.tuition_fees.length > 0) {
      baseAmount = Number(course.tuition_fees[0].monthly_cost) || 12000;
    } else if (course.registration_fee) {
      baseAmount = Number(course.registration_fee) || 12000;
    }
  }

  // Previous payments for this month
  const previousPayments: any[] = existingEnrollment.payments?.filter(
    (p: any) => p.installment_month?.toLowerCase() === installment_month.toLowerCase()
  ) || [];
  const alreadyPaid = previousPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const remainingBefore = Math.max(0, baseAmount - alreadyPaid);

  if (remainingBefore <= 0) {
    throw { status: 400, message: `La cuota de ${installment_month} ya se encuentra totalmente saldada.` };
  }

  if (payAmount > remainingBefore) {
    throw { status: 400, message: `El monto a pagar ($${payAmount}) supera el saldo pendiente de la cuota ($${remainingBefore}).` };
  }

  const actualDate = payment_date || new Date().toISOString().split('T')[0];
  const newTotalPaid = alreadyPaid + payAmount;
  const newStatus = newTotalPaid >= baseAmount ? 'Paid' : 'Partial';

  // Create new payment record
  const newPayment = await Payment.create({
    id_enrollment: numEnrollmentId,
    payment_date: actualDate,
    amount: payAmount,
    surcharge: 0,
    discount: 0,
    status: newStatus,
    installment_month,
    payment_method: payment_method || 'Cash'
  });

  return { newPayment, newStatus, payAmount, baseAmount, newTotalPaid };
};

export const getDebtorsService = async (id_academic_year?: string) => {
  const sectionWhere: any = {};
  if (id_academic_year) {
    sectionWhere.id_academic_year = Number(id_academic_year);
  }

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
        as: 'section',
        where: Object.keys(sectionWhere).length > 0 ? sectionWhere : undefined,
        include: [
          {
            model: Course,
            as: 'course',
            include: [{ model: TuitionFee, as: 'tuition_fees' }]
          },
          {
            model: AcademicYear,
            as: 'academic_year'
          }
        ]
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
  const currentYear = now.getFullYear();

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

  for (const enroll of enrollments) {
    const userObj = enroll.user;
    if (!userObj) continue;

    const course = enroll.section?.course;
    const ay = enroll.section?.academic_year;
    const ayYear = ay?.start_date 
      ? new Date(ay.start_date).getFullYear() 
      : (ay?.name?.match(/\d{4}/) ? parseInt(ay.name.match(/\d{4}/)![0], 10) : currentYear);
    const isPastYear = ayYear < currentYear;

    const dueMonths = isPastYear ? academicMonths : academicMonths.filter(m => m.monthNum <= currentMonthNum);

    let baseAmount = 12000;
    if (course) {
      if (course.tuition_fees && course.tuition_fees.length > 0) {
        baseAmount = Number(course.tuition_fees[0].monthly_cost) || 12000;
      } else if (course.registration_fee) {
        baseAmount = Number(course.registration_fee) || 12000;
      }
    }

    const payments: any[] = enroll.payments || [];
    const unpaidInstallments: string[] = [];
    let totalDebt = 0;

    for (const m of dueMonths) {
      const monthPayments = payments.filter(
        p => p.installment_month?.toLowerCase() === m.name.toLowerCase()
      );
      const totalPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const remaining = Math.max(0, baseAmount - totalPaid);

      if (remaining > 0) {
        unpaidInstallments.push(m.name);
        totalDebt += remaining;
      }
    }

    if (unpaidInstallments.length > 0) {
      debtorsMap.set(userObj.id, {
        id: userObj.id,
        fullName: `${userObj.last_name}, ${userObj.first_name}`,
        dni: userObj.dni,
        course: enroll.section?.name || 'General Course',
        academic_year: ay?.name || 'General',
        unpaidInstallments: unpaidInstallments.length,
        totalDebt
      });
    }
  }

  return Array.from(debtorsMap.values());
};
