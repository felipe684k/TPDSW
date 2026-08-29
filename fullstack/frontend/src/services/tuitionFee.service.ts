import { API_BASE_URL } from '../config';

export interface TuitionFee {
  id_tuition_fee?: number;
  id_course: number;
  start_date: string;
  monthly_cost: number;
  course?: {
    course_name: string;
  };
}

const API_URL = `${API_BASE_URL}/tuition-fees`;

export const tuitionFeeService = {
  getTuitionFees: async (): Promise<TuitionFee[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error fetching tuition fees');
    return response.json();
  },

  createTuitionFee: async (data: Partial<TuitionFee>): Promise<TuitionFee> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating tuition fee');
    return response.json();
  }
};
