import { Op } from 'sequelize';
import { ENROLLMENT_STATUS, INSTALLMENT_STATUS } from '../../constants.js';
import { Payment, Enrollment, User, Section, Course, TuitionFee, AcademicYear, Classroom, Schedule } from '../../models/index.js';

export const ACADEMIC_MONTHS = [
  { name: 'Marzo', enName: 'March', monthNum: 3 },
  { name: 'Abril', enName: 'April', monthNum: 4 },
  { name: 'Mayo', enName: 'May', monthNum: 5 },
  { name: 'Junio', enName: 'June', monthNum: 6 },
  { name: 'Julio', enName: 'July', monthNum: 7 },
  { name: 'Agosto', enName: 'August', monthNum: 8 },
  { name: 'Septiembre', enName: 'September', monthNum: 9 },
  { name: 'Octubre', enName: 'October', monthNum: 10 },
  { name: 'Noviembre', enName: 'November', monthNum: 11 },
  { name: 'Diciembre', enName: 'December', monthNum: 12 }
];

export const matchesMonth = (value: string | undefined, m: { name: string; enName: string }) => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower === m.name.toLowerCase() || lower === m.enName.toLowerCase();
};

const DEFAULT_MONTHLY_FEE = 12000;

// Fecha local en formato AAAA-MM-DD (sin pasar por UTC)
const toLocalDateString = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Año calendario del ciclo lectivo (por su fecha de inicio, o por el número en el nombre)
export const getAcademicYearNumber = (ay: any): number => {
  if (ay?.start_date) return parseInt(toLocalDateString(ay.start_date).slice(0, 4), 10);
  const fromName = ay?.name?.match(/\d{4}/);
  return fromName ? parseInt(fromName[0], 10) : new Date().getFullYear();
};

/**
 * Valor de la cuota de un mes: la tarifa vigente al vencimiento (día 10 de ese mes).
 * Si la tarifa del curso se cargó después de ese vencimiento, se usa la primera tarifa.
 * Sin mes (por ejemplo, un mes desconocido) se usa la tarifa más reciente.
 */
export const getMonthlyFee = (course: any, year?: number, monthNum?: number): number => {
  const fees = [...(course?.tuition_fees || [])].sort((a: any, b: any) =>
    toLocalDateString(a.start_date).localeCompare(toLocalDateString(b.start_date)) ||
    Number(a.id_tuition_fee) - Number(b.id_tuition_fee)
  );

  if (fees.length === 0) {
    return Number(course?.registration_fee) || DEFAULT_MONTHLY_FEE;
  }

  let chosen = fees[fees.length - 1];
  if (year && monthNum) {
    const dueDate = `${year}-${String(monthNum).padStart(2, '0')}-10`;
    chosen = fees[0];
    for (const fee of fees) {
      if (toLocalDateString(fee.start_date) <= dueDate) chosen = fee;
    }
  }
  return Number(chosen.monthly_cost) || DEFAULT_MONTHLY_FEE;
};

export class PaymentError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'PaymentError';
    this.statusCode = statusCode;
  }
}

export interface RegisterPaymentDto {
  id_enrollment: number | string;
  installment_month: string;
  amount: number | string;
  payment_method?: string;
  payment_date?: string;
}

export class PaymentService {
  async findAll() {
    return await Payment.findAll({
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
  }

  async getStudentAccountStatus(id_user: string | number, id_academic_year?: number) {
    const sectionWhere: any = {};
    if (id_academic_year) {
      sectionWhere.id_academic_year = Number(id_academic_year);
    }

    const enrollments: any = await Enrollment.findAll({
      where: { id_user: Number(id_user) },
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
            },
            {
              model: Classroom,
              as: 'classroom'
            },
            {
              model: Schedule,
              as: 'schedules'
            },
            {
              model: User,
              as: 'professors',
              attributes: ['id', 'first_name', 'last_name', 'email']
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
      return {
        enrollments: [],
        installments: [],
        message: 'El alumno no posee inscripciones registradas para este período académico'
      };
    }

    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const installmentResults: any[] = [];

    for (const enroll of enrollments) {
      const course = enroll.section?.course;
      const ay = enroll.section?.academic_year;
      const ayName = ay?.name || 'Ciclo Lectivo';
      const ayYear = getAcademicYearNumber(ay);

      const isPastYear = ayYear < currentYear;
      const isFutureYear = ayYear > currentYear;
      const isDropped = enroll.status === ENROLLMENT_STATUS.DROPPED;

      const registeredPayments: any[] = enroll.payments || [];
      const hasPayments = (m: typeof ACADEMIC_MONTHS[number]) =>
        registeredPayments.some(p => matchesMonth(p.installment_month, m));

      // Se muestran todas las cuotas del ciclo (también las que todavía no vencieron, para poder adelantarlas).
      // Una inscripción dada de baja ya no genera cuotas a cobrar: solo se muestran los meses que se pagaron.
      const monthsToShow = isDropped ? ACADEMIC_MONTHS.filter(hasPayments) : ACADEMIC_MONTHS;

      monthsToShow.forEach((m) => {
        const baseAmount = getMonthlyFee(course, ayYear, m.monthNum);
        const monthPayments = registeredPayments.filter(p => matchesMonth(p.installment_month, m));
        const totalPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const remainingAmount = Math.max(0, baseAmount - totalPaid);
        const dueDate = `10/${m.monthNum.toString().padStart(2, '0')}/${ayYear}`;
        // Vencida: ciclo pasado, o mes actual / anterior del ciclo en curso (mismo criterio que deudores)
        const isDue = isPastYear || (!isFutureYear && m.monthNum <= currentMonthNum);

        let status: string = isDue ? INSTALLMENT_STATUS.PENDING : INSTALLMENT_STATUS.UPCOMING;
        if (totalPaid >= baseAmount) {
          status = INSTALLMENT_STATUS.PAID;
        } else if (totalPaid > 0) {
          status = INSTALLMENT_STATUS.PARTIAL;
        }

        const lastPayment = monthPayments.length > 0 ? monthPayments[monthPayments.length - 1] : null;

        installmentResults.push({
          id: lastPayment ? lastPayment.id_payment : `pending_${enroll.id_enrollment}_${m.monthNum}`,
          id_enrollment: enroll.id_enrollment,
          id_course: course?.id_course,
          course_name: course?.course_name || 'Curso',
          section: enroll.section?.name || 'Comisión',
          id_academic_year: ay?.id_academic_year,
          academic_year_name: ayName,
          year: ayYear,
          installment_month: m.name,
          amount: baseAmount,
          total_paid: totalPaid,
          remaining_amount: remainingAmount,
          due_date: dueDate,
          is_due: isDue,
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

    return {
      enrollments,
      installments: installmentResults
    };
  }

  async registerPayment(data: RegisterPaymentDto) {
    const { id_enrollment, installment_month, amount, payment_method, payment_date } = data;

    const numEnrollmentId = typeof id_enrollment === 'number' ? id_enrollment : parseInt(id_enrollment, 10);

    if (!numEnrollmentId || isNaN(numEnrollmentId)) {
      throw new PaymentError('Se requiere una inscripción válida para registrar un pago.', 400);
    }

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
      throw new PaymentError('No se encontró la inscripción especificada en la base de datos.', 404);
    }

    const payAmount = Number(amount);
    if (!installment_month || isNaN(payAmount) || payAmount <= 0) {
      throw new PaymentError('Monto y mes de cuota válidos son requeridos.', 400);
    }

    if (existingEnrollment.status === ENROLLMENT_STATUS.DROPPED) {
      throw new PaymentError('No se pueden registrar pagos de una inscripción dada de baja.', 400);
    }

    // Solo se cobran los meses del ciclo lectivo (Marzo a Diciembre). Se aceptan cuotas adelantadas.
    const month = ACADEMIC_MONTHS.find(m => matchesMonth(String(installment_month).trim(), m));
    if (!month) {
      throw new PaymentError(`"${installment_month}" no es un mes de cuota válido. Las cuotas van de Marzo a Diciembre.`, 400);
    }

    const course = existingEnrollment.section?.course;
    const baseAmount = getMonthlyFee(course, getAcademicYearNumber(existingEnrollment.section?.academic_year), month.monthNum);

    // Pagos previos de ese mes, sin importar cómo se haya escrito el nombre (ej. "March" = "Marzo")
    const previousPayments: any[] = existingEnrollment.payments?.filter(
      (p: any) => matchesMonth(p.installment_month, month)
    ) || [];
    const alreadyPaid = previousPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const remainingBefore = Math.max(0, baseAmount - alreadyPaid);

    if (remainingBefore <= 0) {
      throw new PaymentError(`La cuota de ${month.name} ya se encuentra totalmente saldada.`, 400);
    }

    if (payAmount > remainingBefore) {
      throw new PaymentError(`El monto a pagar ($${payAmount}) supera el saldo pendiente de la cuota ($${remainingBefore}).`, 400);
    }

    const actualDate = payment_date || new Date().toISOString().split('T')[0];
    const newTotalPaid = alreadyPaid + payAmount;
    const newStatus = newTotalPaid >= baseAmount ? 'Pagado' : 'Parcial';

    const newPayment = await Payment.create({
      id_enrollment: numEnrollmentId,
      payment_date: actualDate,
      amount: payAmount,
      surcharge: 0,
      discount: 0,
      status: newStatus,
      installment_month: month.name, // siempre se guarda en español
      payment_method: payment_method || 'Efectivo'
    });

    const message = newStatus === 'Pagado'
      ? 'Cuota saldada exitosamente'
      : `Pago parcial de $${payAmount} registrado. Saldo pendiente: $${baseAmount - newTotalPaid}`;

    return {
      payment: newPayment,
      message,
      status: newStatus
    };
  }

  async getDebtors(id_academic_year?: number) {
    const sectionWhere: any = {};
    if (id_academic_year) {
      sectionWhere.id_academic_year = Number(id_academic_year);
    }

    const enrollments: any = await Enrollment.findAll({
      where: { status: { [Op.in]: ['Activo', 'Active'] } },
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

    for (const enroll of enrollments) {
      const userObj = enroll.user;
      if (!userObj) continue;

      const course = enroll.section?.course;
      const ay = enroll.section?.academic_year;
      const ayYear = getAcademicYearNumber(ay);
      const isPastYear = ayYear < currentYear;
      const isFutureYear = ayYear > currentYear;

      const dueMonths = isPastYear
        ? ACADEMIC_MONTHS
        : isFutureYear
        ? []
        : ACADEMIC_MONTHS.filter(m => m.monthNum <= currentMonthNum);

      const payments: any[] = enroll.payments || [];
      const unpaidInstallments: string[] = [];
      let totalDebt = 0;

      for (const m of dueMonths) {
        const monthPayments = payments.filter(p => matchesMonth(p.installment_month, m));
        const totalPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const remaining = Math.max(0, getMonthlyFee(course, ayYear, m.monthNum) - totalPaid);

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
          course: enroll.section?.name || 'Curso General',
          academic_year: ay?.name || 'General',
          unpaidInstallments: unpaidInstallments.length,
          totalDebt
        });
      }
    }

    return Array.from(debtorsMap.values());
  }
}
