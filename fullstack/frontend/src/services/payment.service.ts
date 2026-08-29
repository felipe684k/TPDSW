import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/payments`;

export interface Installment {
  id: number | string;
  id_enrollment?: number;
  section?: string;
  installment_month: string;
  amount: number;
  due_date: string;
  status: string;
  payment_date: string | null;
  surcharge: number;
  discount: number;
  paymentMethod?: string;
}

export interface RegisterPaymentPayload {
  id_enrollment: number;
  installment_month: string;
  amount: number;
  surcharge: number;
  discount: number;
  status: string;
  payment_date: string;
}

export interface AccountStatus {
  enrollments: any[];
  installments: Installment[];
}

export interface Debtor {
  id: number;
  fullName: string;
  dni: string;
  course: string;
  unpaidInstallments: number;
  totalDebt: number;
}

export const paymentService = {
  getAllPayments: async (): Promise<any[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error fetching payments');
    const json = await response.json();
    return json.data || [];
  },

  getStudentAccountStatus: async (idUser: number): Promise<AccountStatus> => {
    const response = await fetch(`${API_URL}/student/${idUser}`);
    if (!response.ok) throw new Error('Error fetching account status');
    const json = await response.json();
    return json.data || { enrollments: [], installments: [] };
  },

  registerPayment: async (payload: RegisterPaymentPayload): Promise<any> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.message || 'Could not process payment.');
    }
    return json.data;
  },

  getDebtors: async (): Promise<Debtor[]> => {
    const response = await fetch(`${API_URL}/debtors`);
    if (!response.ok) throw new Error('Error fetching debtors');
    const json = await response.json();
    return json.data || [];
  },
};
