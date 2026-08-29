import { API_BASE_URL } from '../config';

export interface AcademicYear {
  id_academic_year?: number;
  name: string;
  start_date: string;
  end_date: string;
}

export const academicYearService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const res = await fetch(`${API_BASE_URL}/academic-years`);
    const json = await res.json();
    return json.data;
  },

  createAcademicYear: async (academicYear: AcademicYear): Promise<AcademicYear> => {
    const res = await fetch(`${API_BASE_URL}/academic-years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(academicYear)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  updateAcademicYear: async (id: number, academicYear: Partial<AcademicYear>): Promise<AcademicYear> => {
    const res = await fetch(`${API_BASE_URL}/academic-years/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(academicYear)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  deleteAcademicYear: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/academic-years/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  }
};
