import { Op } from 'sequelize';
import { User } from '../models/user.js';

export const getAllProfessorsService = async (search?: string, status?: string) => {
  let searchConditions: any = { role: 'PROFESSOR' };

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

  return await User.findAll({
    where: searchConditions,
    order: [['last_name', 'ASC']]
  });
};

export const checkProfessorDniService = async (dni: string) => {
  let prof = await User.findOne({ where: { dni, role: 'PROFESSOR', active: true } });
  if (prof) return prof;

  prof = await User.findOne({
    where: {
      dni: { [Op.like]: `${dni}_deleted_%` },
      role: 'PROFESSOR',
      active: false
    }
  });

  return prof || null;
};

export const createProfessorService = async (data: any) => {
  const { dni, first_name, last_name, phone, email, birth_date } = data;

  if (!dni || !first_name || !last_name) {
    throw { status: 400, message: 'DNI, First Name and Last Name are required' };
  }

  const activeExistingProfessor = await User.findOne({ where: { dni, active: true } });
  if (activeExistingProfessor) {
    throw { status: 409, message: 'A user with DNI already exists: ' + dni };
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
      first_name, last_name, phone, email, birth_date, dni, username: dni, active: true
    });
    return { created: false, professor: inactiveProfessor };
  }

  const newProfessor = await User.create({
    dni, first_name, last_name, phone, email, birth_date,
    username: dni, password: dni, role: 'PROFESSOR', active: true 
  });
  return { created: true, professor: newProfessor };
};

export const updateProfessorService = async (id: string, data: any) => {
  const existingProfessor = await User.findOne({ where: { id, role: 'PROFESSOR' } });
  if (!existingProfessor) {
    throw { status: 404, message: 'Professor not found with ID ' + id };
  }

  const dataToUpdate: any = {};
  if (data.dni !== undefined) dataToUpdate.dni = data.dni;
  if (data.first_name !== undefined) dataToUpdate.first_name = data.first_name;
  if (data.last_name !== undefined) dataToUpdate.last_name = data.last_name;
  if (data.phone !== undefined) dataToUpdate.phone = data.phone;
  if (data.email !== undefined) dataToUpdate.email = data.email;
  if (data.birth_date !== undefined) dataToUpdate.birth_date = data.birth_date;
  if (data.active !== undefined) dataToUpdate.active = data.active;

  await User.update(dataToUpdate, { where: { id, role: 'PROFESSOR' } });
  return { id, ...dataToUpdate };
};

export const deleteProfessorService = async (id: string) => {
  const professor: any = await User.findOne({ where: { id, role: 'PROFESSOR', active: true } });
  if (!professor) {
    throw { status: 404, message: 'Active professor not found with ID ' + id };
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
};
