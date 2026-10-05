import { type Request, type Response } from 'express';
import * as userService from '../services/user.service.js';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, level } = req.query;
    const cleanUsers = await userService.getAllUsers(search as string, level as string);
    res.status(200).json({ status: 'ok', message: 'List fetched successfully', data: cleanUsers });
  } catch (error: any) {
    console.error('Error querying users:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};

export const checkStudentDni = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    const student = await userService.checkStudentDni(dni);
    
    if (student) {
      res.status(200).json({ status: 'ok', data: student });
      return;
    }

    res.status(200).json({ status: 'not_found', data: null });
  } catch (error: any) {
    console.error('Error checking student DNI:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const data = await userService.login(username, password);
    res.status(200).json({ status: 'ok', message: 'Login successful', data });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ status: error.statusMsg, message: error.message, data: null });
      return;
    }
    console.error('Error logging in:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error logging in', data: null });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await userService.getUserById(id);
    res.status(200).json({ status: 'ok', message: 'Student found successfully', data });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ status: error.statusMsg, message: error.message, data: null });
      return;
    }
    console.error('Error finding student with ID ' + req.params.id + ':', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error finding student', data: null });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userService.createUser(req.body);
    if (result.reactivated) {
      res.status(200).json({ status: 'ok', message: 'Student reactivated successfully', data: result.user });
    } else {
      res.status(201).json({ status: 'ok', message: 'Student created successfully', data: result.user });
    }
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ status: error.statusMsg, message: error.message, data: null });
      return;
    }
    console.error('Error creating student:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error', data: null });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await userService.updateUser(id, req.body);
    res.status(200).json({ status: 'ok', message: 'Student updated successfully', data });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ status: error.statusMsg, message: error.message, data: null });
      return;
    }
    console.error('Error updating student:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error', data: null });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(200).json({ status: 'ok', message: 'Student deactivated successfully', data: null });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ status: error.statusMsg, message: error.message, data: null });
      return;
    }
    console.error('Error deactivating student:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error', data: null });
  }
};
