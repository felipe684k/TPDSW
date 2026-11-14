import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { ENROLLMENT_STATUS, INSTALLMENT_STATUS, REGISTRATION_INSTALLMENT } from '../../constants.js';
import { Payment, Enrollment, User, Section, Course, TuitionFee, AcademicYear, Classroom, Schedule } from '../../models/index.js';
import { todayLocalDate, toArgentinaDateString, currentArgentinaYearMonth } from '../../utils/date.js';
import { formatMoney } from '../../utils/money.js';

/**
 * SERVICE DE PAGOS
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un PaymentError con su código.
 *
 * CASO DE USO 4: registrar pagos de cuotas y generar el reporte de alumnos deudores.
 * Usa los datos de las inscripciones (CUU 2): de cada inscripción salen la matrícula y las cuotas.
 *
 * Reglas de cobro:
 *   - Matrícula: se cobra una vez y se debe desde el día de la inscripción.
 *   - Cuotas: de Marzo a Diciembre, desde el mes en que se inscribió el alumno.
 *   - Cada cuota vence el día 10; si el alumno se inscribió después, vence el día de la inscripción.
 *   - Recién se considera deuda al día siguiente del vencimiento.
 *   - Se puede pagar en partes (pagos parciales) y adelantar cuotas que todavía no vencieron.
 *
 * Arriba están las funciones auxiliares (helpers) y abajo la clase PaymentService.
 */

// ─── HELPERS ────────────────────────────────────────────────────────────────

// Meses del ciclo lectivo que se cobran. enName permite reconocer pagos viejos guardados en inglés.
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

// true si el texto guardado en un pago corresponde a ese mes ("Marzo", "marzo" o "March")
export const matchesMonth = (value: string | undefined, m: { name: string; enName: string }) => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower === m.name.toLowerCase() || lower === m.enName.toLowerCase();
};

// true si el texto se refiere a la matrícula ("Matrícula", "matricula", etc.), sin importar tildes ni mayúsculas
export const isRegistrationInstallment = (value: string | undefined): boolean => {
  if (!value) return false;
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  return normalize(value) === normalize(REGISTRATION_INSTALLMENT);
};

// Valor de la matrícula del curso (0 si el curso no cobra matrícula)
export const getRegistrationFee = (course: any): number => Math.max(0, Number(course?.registration_fee) || 0);

// Suma de lo pagado en una lista de pagos
const sumPaid = (payments: any[]): number => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

// Estado de una cuota según lo pagado: Pagado, Parcial, Pendiente (vencida) o A vencer
const getInstallmentStatus = (baseAmount: number, totalPaid: number, isDue: boolean): string => {
  if (totalPaid >= baseAmount) return INSTALLMENT_STATUS.PAID;
  if (totalPaid > 0) return INSTALLMENT_STATUS.PARTIAL;
  return isDue ? INSTALLMENT_STATUS.PENDING : INSTALLMENT_STATUS.UPCOMING;
};

// "AAAA-MM-DD" -> "DD/MM/AAAA"
const toDisplayDate = (isoDate: string): string => {
  const [y, m, d] = isoDate.split('-');
  return y && m && d ? `${d}/${m}/${y}` : isoDate;
};

// Valor de respaldo, solo si un curso no tuviera ninguna cuota cargada
const DEFAULT_MONTHLY_FEE = 12000;

// Las cuotas vencen el día 10 de cada mes
export const INSTALLMENT_DUE_DAY = 10;

/**
 * Fecha de vencimiento de la cuota de un mes, en formato AAAA-MM-DD.
 * Si el alumno se inscribió después del día 10 de ese mes, la cuota vence el día de la inscripción
 * (no puede estar vencida antes de que el alumno se inscriba).
 */
export const getInstallmentDueDate = (year: number, monthNum: number, enrollmentDate?: string): string => {
  const regularDueDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(INSTALLMENT_DUE_DAY).padStart(2, '0')}`;
  return enrollmentDate && enrollmentDate > regularDueDate ? enrollmentDate : regularDueDate;
};

/**
 * Una cuota está vencida (es deuda) recién al día siguiente de su vencimiento.
 * Hasta el día 10 inclusive figura "A vencer": se puede pagar, pero todavía no se debe.
 */
export const isInstallmentDue = (
  year: number,
  monthNum: number,
  today: string = todayLocalDate(),
  enrollmentDate?: string
): boolean => today > getInstallmentDueDate(year, monthNum, enrollmentDate);

/**
 * Primer mes que se le cobra a una inscripción: el mes en que se inscribió.
 * Si se inscribió antes de que empiece el ciclo, se cobra desde Marzo; si se inscribió en un año
 * posterior al del ciclo, no corresponde ninguna cuota (devuelve 13).
 */
export const getFirstBillableMonth = (ayYear: number, enrollmentDate?: string): number => {
  const firstMonth = ACADEMIC_MONTHS[0]!.monthNum;
  if (!enrollmentDate) return firstMonth;
  const [enrollYear, enrollMonth] = enrollmentDate.split('-').map(Number) as [number, number];
  if (enrollYear < ayYear) return firstMonth;
  if (enrollYear > ayYear) return 13;
  return Math.max(firstMonth, enrollMonth);
};

// Fecha en formato AAAA-MM-DD según la hora argentina (sin pasar por UTC)
const toLocalDateString = (value: any): string => {
  if (!value) return '';
  // Una fecha sin hora (DATEONLY) ya está en el formato correcto
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : toArgentinaDateString(d);
};

// Año calendario del ciclo lectivo (por su fecha de inicio, o por el número en el nombre)
export const getAcademicYearNumber = (ay: any): number => {
  if (ay?.start_date) return parseInt(toLocalDateString(ay.start_date).slice(0, 4), 10);
  const fromName = ay?.name?.match(/\d{4}/);
  return fromName ? parseInt(fromName[0], 10) : currentArgentinaYearMonth().year;
};

/**
 * Valor de la cuota de un mes: la tarifa vigente al vencimiento (día INSTALLMENT_DUE_DAY de ese mes).
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

  // fees está ordenado de la más vieja a la más nueva: se queda con la última que ya regía al vencimiento
  let chosen = fees[fees.length - 1];
  if (year && monthNum) {
    const dueDate = getInstallmentDueDate(year, monthNum);
    chosen = fees[0];
    for (const fee of fees) {
      if (toLocalDateString(fee.start_date) <= dueDate) chosen = fee;
    }
  }
  return Number(chosen.monthly_cost) || DEFAULT_MONTHLY_FEE;
};

// ─── SERVICE ────────────────────────────────────────────────────────────────

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class PaymentError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'PaymentError';
  }
}

// DTO: datos que llegan del front para registrar un pago
export interface RegisterPaymentDto {
  id_enrollment: number | string;
  installment_month: string;
  amount: number | string;
  payment_method?: string;
  payment_date?: string;
}

export class PaymentService {
  // Todos los pagos, del más nuevo al más viejo, con el alumno y la comisión de cada uno
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

  /**
   * Estado de cuenta de un alumno (opcionalmente de un solo ciclo lectivo).
   * Para cada inscripción arma la lista de ítems a cobrar: primero la matrícula y después las
   * cuotas mensuales, cada una con su monto, lo pagado, el saldo, el vencimiento y su estado.
   * No se guarda nada: se calcula en el momento a partir de las inscripciones y los pagos.
   */
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

    const today = todayLocalDate();

    const installmentResults: any[] = [];

    for (const enroll of enrollments) {
      const course = enroll.section?.course;
      const ay = enroll.section?.academic_year;
      const ayName = ay?.name || 'Ciclo Lectivo';
      const ayYear = getAcademicYearNumber(ay);

      const isDropped = enroll.status === ENROLLMENT_STATUS.DROPPED;
      const enrollmentDate = toLocalDateString(enroll.enrollment_date);
      const firstBillableMonth = getFirstBillableMonth(ayYear, enrollmentDate);

      const registeredPayments: any[] = enroll.payments || [];

      // Arma un ítem del estado de cuenta (matrícula o cuota mensual) con lo pagado hasta ahora
      const addInstallment = (item: {
        key: string;
        name: string;
        baseAmount: number;
        dueDate: string;
        isDue: boolean;
        payments: any[];
      }) => {
        const totalPaid = sumPaid(item.payments);
        const lastPayment = item.payments.length > 0 ? item.payments[item.payments.length - 1] : null;

        installmentResults.push({
          id: lastPayment ? lastPayment.id_payment : `pending_${enroll.id_enrollment}_${item.key}`,
          id_enrollment: enroll.id_enrollment,
          id_course: course?.id_course,
          course_name: course?.course_name || 'Curso',
          section: enroll.section?.name || 'Comisión',
          id_academic_year: ay?.id_academic_year,
          academic_year_name: ayName,
          year: ayYear,
          installment_month: item.name,
          amount: item.baseAmount,
          total_paid: totalPaid,
          remaining_amount: Math.max(0, item.baseAmount - totalPaid),
          due_date: item.dueDate,
          is_due: item.isDue,
          status: getInstallmentStatus(item.baseAmount, totalPaid, item.isDue),
          payment_date: lastPayment ? lastPayment.payment_date : null,
          payment_method: lastPayment ? lastPayment.payment_method : null,
          payments: item.payments.map(p => ({
            id: p.id_payment,
            amount: Number(p.amount),
            payment_date: p.payment_date,
            payment_method: p.payment_method,
            status: p.status
          }))
        });
      };

      // 1. Matrícula: se debe desde el día de la inscripción.
      // Una inscripción dada de baja solo la muestra si se había pagado algo.
      const registrationFee = getRegistrationFee(course);
      const registrationPayments = registeredPayments.filter(p => isRegistrationInstallment(p.installment_month));
      if (registrationFee > 0 && (!isDropped || registrationPayments.length > 0)) {
        addInstallment({
          key: 'registration',
          name: REGISTRATION_INSTALLMENT,
          baseAmount: registrationFee,
          dueDate: enrollmentDate ? toDisplayDate(enrollmentDate) : '-',
          isDue: true,
          payments: registrationPayments
        });
      }

      // 2. Cuotas mensuales: desde el mes de inscripción hasta Diciembre (también las que todavía no vencieron,
      // para poder adelantarlas). Una inscripción dada de baja ya no genera cuotas a cobrar.
      // Siempre se muestran los meses que tienen pagos registrados.
      const hasPayments = (m: typeof ACADEMIC_MONTHS[number]) =>
        registeredPayments.some(p => matchesMonth(p.installment_month, m));
      const monthsToShow = ACADEMIC_MONTHS.filter(m =>
        hasPayments(m) || (!isDropped && m.monthNum >= firstBillableMonth)
      );

      monthsToShow.forEach((m) => {
        addInstallment({
          key: String(m.monthNum),
          name: m.name,
          baseAmount: getMonthlyFee(course, ayYear, m.monthNum),
          dueDate: toDisplayDate(getInstallmentDueDate(ayYear, m.monthNum, enrollmentDate)),
          // Vencida: ya pasó el día de vencimiento (mismo criterio que deudores)
          isDue: isInstallmentDue(ayYear, m.monthNum, today, enrollmentDate),
          payments: registeredPayments.filter(p => matchesMonth(p.installment_month, m))
        });
      });
    }

    return {
      enrollments,
      installments: installmentResults
    };
  }

  /**
   * Registra un pago (total o parcial) de la matrícula o de una cuota mensual.
   * Valida: que la inscripción exista y esté activa, que el mes sea válido y no anterior a la
   * inscripción, que el concepto no esté ya saldado y que el monto no supere el saldo pendiente.
   * El pago se guarda con estado "Pagado" si completa el total, o "Parcial" si todavía falta.
   */
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

    const course = existingEnrollment.section?.course;
    const enrollmentPayments: any[] = existingEnrollment.payments || [];

    // Qué se está pagando: la matrícula o una cuota mensual. Se define el nombre con que se guarda,
    // el monto total a cobrar y los pagos previos de ese mismo concepto.
    let installmentName: string;
    let installmentLabel: string;
    let baseAmount: number;
    let previousPayments: any[];

    if (isRegistrationInstallment(String(installment_month))) {
      baseAmount = getRegistrationFee(course);
      if (baseAmount <= 0) {
        throw new PaymentError('El curso de esta inscripción no cobra matrícula.', 400);
      }
      installmentName = REGISTRATION_INSTALLMENT;
      installmentLabel = 'La matrícula';
      previousPayments = enrollmentPayments.filter(p => isRegistrationInstallment(p.installment_month));
    } else {
      // Solo se cobran los meses del ciclo lectivo (Marzo a Diciembre). Se aceptan cuotas adelantadas.
      const month = ACADEMIC_MONTHS.find(m => matchesMonth(String(installment_month).trim(), m));
      if (!month) {
        throw new PaymentError(`"${installment_month}" no es un mes de cuota válido. Las cuotas van de Marzo a Diciembre.`, 400);
      }
      const ayYear = getAcademicYearNumber(existingEnrollment.section?.academic_year);
      const firstBillableMonth = getFirstBillableMonth(ayYear, toLocalDateString(existingEnrollment.enrollment_date));
      if (month.monthNum < firstBillableMonth) {
        const firstName = ACADEMIC_MONTHS.find(m => m.monthNum === firstBillableMonth)?.name;
        throw new PaymentError(
          firstName
            ? `El alumno se inscribió en ${firstName}: no se cobran cuotas anteriores a ese mes.`
            : 'Esta inscripción no tiene cuotas mensuales a cobrar en este ciclo lectivo.',
          400
        );
      }
      baseAmount = getMonthlyFee(course, ayYear, month.monthNum);
      installmentName = month.name; // siempre se guarda en español
      installmentLabel = `La cuota de ${month.name}`;
      // Pagos previos de ese mes, sin importar cómo se haya escrito el nombre (ej. "March" = "Marzo")
      previousPayments = enrollmentPayments.filter(p => matchesMonth(p.installment_month, month));
    }

    // Cuánto se pagó antes y cuánto falta: no se puede pagar algo saldado ni pagar de más
    const alreadyPaid = sumPaid(previousPayments);
    const remainingBefore = Math.max(0, baseAmount - alreadyPaid);

    if (remainingBefore <= 0) {
      throw new PaymentError(`${installmentLabel} ya se encuentra totalmente saldada.`, 400);
    }

    if (payAmount > remainingBefore) {
      throw new PaymentError(`El monto a pagar (${formatMoney(payAmount)}) supera el saldo pendiente (${formatMoney(remainingBefore)}).`, 400);
    }

    const actualDate = payment_date || todayLocalDate();
    const newTotalPaid = alreadyPaid + payAmount;
    const newStatus = newTotalPaid >= baseAmount ? 'Pagado' : 'Parcial';

    const newPayment = await Payment.create({
      id_enrollment: numEnrollmentId,
      payment_date: actualDate,
      amount: payAmount,
      surcharge: 0,
      discount: 0,
      status: newStatus,
      installment_month: installmentName,
      payment_method: payment_method || 'Efectivo'
    });

    const message = newStatus === 'Pagado'
      ? (installmentName === REGISTRATION_INSTALLMENT ? 'Matrícula saldada exitosamente' : 'Cuota saldada exitosamente')
      : `Pago parcial de ${formatMoney(payAmount)} registrado. Saldo pendiente: ${formatMoney(baseAmount - newTotalPaid)}`;

    return {
      payment: newPayment,
      message,
      status: newStatus
    };
  }

  /**
   * Reporte de deudores (opcionalmente de un solo ciclo lectivo).
   * Recorre las inscripciones activas de alumnos activos y suma lo que deben:
   * la matrícula sin pagar y las cuotas ya vencidas sin pagar (las "A vencer" no cuentan).
   * Devuelve una fila por alumno con el total de deuda y qué conceptos debe.
   */
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

    // Map: clave = id del alumno, valor = su fila del reporte (para acumular varias inscripciones)
    const debtorsMap = new Map();
    const today = todayLocalDate();

    for (const enroll of enrollments) {
      const userObj = enroll.user;
      if (!userObj) continue;

      const course = enroll.section?.course;
      const ay = enroll.section?.academic_year;
      const ayYear = getAcademicYearNumber(ay);

      const enrollmentDate = toLocalDateString(enroll.enrollment_date);
      const firstBillableMonth = getFirstBillableMonth(ayYear, enrollmentDate);
      // Meses que ya vencieron desde que se inscribió
      const dueMonths = ACADEMIC_MONTHS.filter(m =>
        m.monthNum >= firstBillableMonth && isInstallmentDue(ayYear, m.monthNum, today, enrollmentDate)
      );

      const payments: any[] = enroll.payments || [];
      const unpaidInstallments: string[] = [];
      let totalDebt = 0;

      // La matrícula se debe desde la inscripción
      const registrationRemaining = Math.max(
        0,
        getRegistrationFee(course) - sumPaid(payments.filter(p => isRegistrationInstallment(p.installment_month)))
      );
      if (registrationRemaining > 0) {
        unpaidInstallments.push(REGISTRATION_INSTALLMENT);
        totalDebt += registrationRemaining;
      }

      for (const m of dueMonths) {
        const totalPaid = sumPaid(payments.filter(p => matchesMonth(p.installment_month, m)));
        const remaining = Math.max(0, getMonthlyFee(course, ayYear, m.monthNum) - totalPaid);

        if (remaining > 0) {
          unpaidInstallments.push(m.name);
          totalDebt += remaining;
        }
      }

      if (unpaidInstallments.length === 0) continue;

      // Un alumno puede deber en varias inscripciones (dos cursos, o un ciclo anterior y el actual):
      // se acumula todo en una sola fila en lugar de quedarse con la última inscripción.
      const debtor = debtorsMap.get(userObj.id) ?? {
        id: userObj.id,
        fullName: `${userObj.last_name}, ${userObj.first_name}`,
        dni: userObj.dni,
        courses: new Set<string>(),
        academicYears: new Set<string>(),
        unpaidMonths: new Set<string>(),
        unpaidInstallments: 0,
        totalDebt: 0
      };
      debtor.courses.add(enroll.section?.name || 'Curso General');
      debtor.academicYears.add(ay?.name || 'General');
      unpaidInstallments.forEach((m) => debtor.unpaidMonths.add(m));
      debtor.unpaidInstallments += unpaidInstallments.length;
      debtor.totalDebt += totalDebt;
      debtorsMap.set(userObj.id, debtor);
    }

    // Los Set (listas sin repetidos) se convierten en texto separado por comas para el front
    return Array.from(debtorsMap.values()).map(({ courses, academicYears, unpaidMonths, ...debtor }) => ({
      ...debtor,
      course: [...courses].join(', '),
      academic_year: [...academicYears].join(', '),
      unpaid_months: [...unpaidMonths].join(', ')
    }));
  }
}
