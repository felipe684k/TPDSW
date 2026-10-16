import { type Request, type Response } from 'express';
import { ProfessorService } from './professor.service.js';

const professorService = new ProfessorService();

export const getAllProfessors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;
    const professors = await professorService.findAll({ search, status });

    res.status(200).json({ status: 'ok', message: 'Professors fetched successfully', data: professors });
  } catch (error: any) {
    console.error('Error querying professors:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};

export const checkProfessorDni = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    const prof = await professorService.checkDni(dni);

    if (prof) {
      res.status(200).json({ status: 'ok', data: prof });
      return;
    }

    res.status(200).json({ status: 'not_found', data: null });
  } catch (error: any) {
    console.error('Error checking professor DNI:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
  }
};

export const createProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni, first_name, last_name, phone, email, birth_date } = req.body;

    if (!dni || !first_name || !last_name) {
      res.status(400).json({ status: 'error', message: 'DNI, First Name and Last Name are required', data: null });
      return;
    }

    const result = await professorService.create({
      dni,
      first_name,
      last_name,
      phone,
      email,
      birth_date
    });

    if (result.conflict) {
      res.status(409).json({ status: 'error', message: 'A user with DNI already exists: ' + dni, data: null });
      return;
    }

    if (result.reactivated) {
      res.status(201).json({ status: 'ok', message: 'Professor reactivated successfully', data: result.data });
      return;
    }

    res.status(201).json({ status: 'ok', message: 'Professor registered successfully', data: result.data });
  } catch (error: any) {
    console.error('Error registering professor:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error', data: null });
  }
};

export const updateProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dni, first_name, last_name, phone, email, birth_date, active } = req.body;

    const updatedData = await professorService.update(id, {
      dni,
      first_name,
      last_name,
      phone,
      email,
      birth_date,
      active
    });

    if (!updatedData) {
      res.status(404).json({ status: 'error', message: 'Professor not found with ID ' + id, data: null });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Professor updated successfully', data: updatedData });
  } catch (error: any) {
    console.error('Error updating professor:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
  }
};

export const deleteProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await professorService.delete(id);

    if (!deleted) {
      res.status(404).json({ status: 'error', message: 'Active professor not found with ID ' + id, data: null });
      return;
    }

    res.status(200).json({ status: 'ok', message: 'Professor deactivated successfully', data: null });
  } catch (error: any) {
    console.error('Error deactivating professor:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
  }
};
