import { type Request, type Response } from 'express';
import { 
  getAllProfessorsService,
  checkProfessorDniService,
  createProfessorService,
  updateProfessorService,
  deleteProfessorService
} from '../services/professor.service.js';

export const getAllProfessors = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const professors = await getAllProfessorsService(search, status);
    res.status(200).json({ status: 'ok', message: 'Professors fetched successfully', data: professors });
  } catch (error: any) {
    const status = error.status || 500;
    if (status === 500) {
      console.error('Error querying professors:', error?.message || error);
      res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
    } else {
      res.status(status).json({ status: 'error', message: error.message, data: null });
    }
  }
};

export const checkProfessorDni = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    const prof = await checkProfessorDniService(dni);
    
    if (prof) {
      res.status(200).json({ status: 'ok', data: prof });
      return;
    }
    res.status(200).json({ status: 'not_found', data: null });
  } catch (error: any) {
    const status = error.status || 500;
    if (status === 500) {
      console.error('Error checking professor DNI:', error?.message || error);
      res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
    } else {
      res.status(status).json({ status: 'error', message: error.message, data: null });
    }
  }
};

export const createProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createProfessorService(req.body);
    const message = result.created ? 'Professor registered successfully' : 'Professor reactivated successfully';
    res.status(201).json({ status: 'ok', message, data: result.professor });
  } catch (error: any) {
    const status = error.status || 500;
    if (status === 500) {
      console.error('Error registering professor:', error?.message || error);
      res.status(500).json({ status: 'db_error', message: 'Internal server error', data: null });
    } else {
      res.status(status).json({ status: 'error', message: error.message, data: null });
    }
  }
};

export const updateProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedData = await updateProfessorService(id, req.body);
    res.status(200).json({ status: 'ok', message: 'Professor updated successfully', data: updatedData });
  } catch (error: any) {
    const status = error.status || 500;
    if (status === 500) {
      console.error('Error updating professor:', error?.message || error);
      res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
    } else {
      res.status(status).json({ status: 'error', message: error.message, data: null });
    }
  }
};

export const deleteProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteProfessorService(id);
    res.status(200).json({ status: 'ok', message: 'Professor deactivated successfully', data: null });
  } catch (error: any) {
    const status = error.status || 500;
    if (status === 500) {
      console.error('Error deactivating professor:', error?.message || error);
      res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
    } else {
      res.status(status).json({ status: 'error', message: error.message, data: null });
    }
  }
};
