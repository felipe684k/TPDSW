import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/user.js';

export const getAllProfessors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;

    let searchConditions: any = {
      role: 'PROFESSOR'
    };

    if (status === 'Active') {
      searchConditions.active = true;
    } else if (status === 'Leave' || status === 'Inactive') {
      searchConditions.active = false;
    }

    if (search) {
      searchConditions = {
        ...searchConditions,
        [Op.or]: [
          { dni: { [Op.like]: "%" + search + "%" } },
          { first_name: { [Op.like]: "%" + search + "%" } },
          { last_name: { [Op.like]: "%" + search + "%" } }
        ]
      };
    }

    const professors = await User.findAll({
      where: searchConditions,
      order: [['last_name', 'ASC']]
    });

    res.status(200).json({ status: 'ok', message: 'Professors fetched successfully', data: professors });
  } catch (error: any) {
    console.error('Error querying professors:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
  }
};

export const checkProfessorDni = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    
    // First, look for an active one
    let prof: any = await User.findOne({ where: { dni, role: 'PROFESSOR', active: true } });
    if (prof) {
      res.status(200).json({ status: 'ok', data: prof });
      return;
    }

    // Second, look for an inactive one
    prof = await User.findOne({
      where: {
        dni: { [Op.like]: `${dni}_deleted_%` },
        role: 'PROFESSOR',
        active: false
      }
    });

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

    const activeExistingProfessor: any = await User.findOne({ where: { dni, active: true } });
    if (activeExistingProfessor) {
      res.status(409).json({ status: 'error', message: 'A user with DNI already exists: ' + dni, data: null });
      return;
    }

    const inactiveProfessor: any = await User.findOne({
      where: {
        dni: { [Op.like]: `${dni}_deleted_%` },
        role: 'PROFESSOR',
        active: false
      }
    });

    if (inactiveProfessor) {
      await inactiveProfessor.update({
        first_name,
        last_name,
        phone,
        email,
        birth_date,
        dni,
        username: dni,
        active: true
      });
      res.status(201).json({ status: 'ok', message: 'Professor reactivated successfully', data: inactiveProfessor });
      return;
    }

    const newProfessor = await User.create({
      dni, 
      first_name, 
      last_name, 
      phone, 
      email, 
      birth_date,
      username: dni, // Default username is DNI
      password: dni, // Default password is DNI
      role: 'PROFESSOR', 
      active: true 
    });

    res.status(201).json({ status: 'ok', message: 'Professor registered successfully', data: newProfessor });
  } catch (error: any) {
    console.error('Error registering professor:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal server error', data: null });
  }
};

export const updateProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dni, first_name, last_name, phone, email, birth_date, active } = req.body;

    const existingProfessor = await User.findOne({ where: { id, role: 'PROFESSOR' } });
    if (!existingProfessor) {
      res.status(404).json({ status: 'error', message: 'Professor not found with ID ' + id, data: null });
      return;
    }

    const dataToUpdate: any = {};
    if (dni !== undefined) dataToUpdate.dni = dni;
    if (first_name !== undefined) dataToUpdate.first_name = first_name;
    if (last_name !== undefined) dataToUpdate.last_name = last_name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (email !== undefined) dataToUpdate.email = email;
    if (birth_date !== undefined) dataToUpdate.birth_date = birth_date;
    if (active !== undefined) dataToUpdate.active = active;

    await User.update(dataToUpdate, { where: { id, role: 'PROFESSOR' } });

    res.status(200).json({ status: 'ok', message: 'Professor updated successfully', data: { id, ...dataToUpdate } });
  } catch (error: any) {
    console.error('Error updating professor:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
  }
};

export const deleteProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const professor: any = await User.findOne({ where: { id, role: 'PROFESSOR', active: true } });
    
    if (!professor) {
      res.status(404).json({ status: 'error', message: 'Active professor not found with ID ' + id, data: null });
      return;
    }

    const ts = Date.now();
    await User.update(
      { 
        active: false,
        email: professor.email ? `${professor.email}_deleted_${ts}` : null,
        username: `${professor.username}_deleted_${ts}`,
        dni: `${professor.dni}_deleted_${ts}`
      },
      { where: { id, role: 'PROFESSOR', active: true } }
    );
    
    res.status(200).json({ status: 'ok', message: 'Professor deactivated successfully', data: null });
  } catch (error: any) {
    console.error('Error deactivating professor:', error?.message || error);
    res.status(500).json({ status: 'db_error', message: 'Internal error', data: null });
  }
};
