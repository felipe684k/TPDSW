import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../../models/user.js';
import { normalizeEmail, assertUniqueUserFields } from '../user/user.service.js';

export class ProfessorService {
  async findAll(filters: { search?: any; status?: any }) {
    const { search, status } = filters;

    let searchConditions: any = {
      role: 'PROFESSOR'
    };

    if (status === 'Activo' || status === 'Active') {
      searchConditions.active = true;
    } else if (status === 'Licencia' || status === 'Inactivo' || status === 'Leave' || status === 'Inactive') {
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
  }

  async checkDni(dni: any) {
    let prof: any = await User.findOne({ where: { dni, role: 'PROFESSOR', active: true } });
    if (prof) {
      return prof;
    }

    prof = await User.findOne({
      where: {
        dni: { [Op.like]: `${dni}_deleted_%` },
        role: 'PROFESSOR',
        active: false
      }
    });

    if (prof) {
      return prof;
    }

    return null;
  }

  async create(data: {
    dni: any;
    first_name: any;
    last_name: any;
    phone: any;
    email: any;
    birth_date: any;
  }) {
    const { dni, first_name, last_name, phone, email, birth_date } = data;

    const activeExistingProfessor: any = await User.findOne({ where: { dni, active: true } });
    if (activeExistingProfessor) {
      return { conflict: true, data: null };
    }

    const inactiveProfessor: any = await User.findOne({
      where: {
        dni: { [Op.like]: `${dni}_deleted_%` },
        role: 'PROFESSOR',
        active: false
      }
    });

    // Email vacío -> NULL, y no puede estar usado por otro usuario
    const cleanEmail = normalizeEmail(email);
    await assertUniqueUserFields({ email: cleanEmail }, inactiveProfessor?.id);

    if (inactiveProfessor) {
      await inactiveProfessor.update({
        first_name,
        last_name,
        phone,
        email: cleanEmail,
        birth_date,
        dni,
        username: dni,
        active: true
      });
      return { conflict: false, reactivated: true, data: inactiveProfessor };
    }

    const newProfessor = await User.create({
      dni,
      first_name,
      last_name,
      phone,
      email: cleanEmail,
      birth_date,
      username: dni,
      // Los docentes no inician sesión, pero la clave nunca se guarda en texto plano
      password: await bcrypt.hash(String(dni), 10),
      role: 'PROFESSOR',
      active: true
    });

    return { conflict: false, reactivated: false, data: newProfessor };
  }

  async update(id: any, data: {
    dni?: any;
    first_name?: any;
    last_name?: any;
    phone?: any;
    email?: any;
    birth_date?: any;
    active?: any;
  }) {
    const { dni, first_name, last_name, phone, email, birth_date, active } = data;

    const existingProfessor = await User.findOne({ where: { id, role: 'PROFESSOR' } });
    if (!existingProfessor) {
      return null;
    }

    const dataToUpdate: any = {};
    if (dni !== undefined) dataToUpdate.dni = dni;
    if (first_name !== undefined) dataToUpdate.first_name = first_name;
    if (last_name !== undefined) dataToUpdate.last_name = last_name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (email !== undefined) dataToUpdate.email = normalizeEmail(email);
    if (birth_date !== undefined) dataToUpdate.birth_date = birth_date;
    if (active !== undefined) dataToUpdate.active = active;

    await assertUniqueUserFields({ dni: dataToUpdate.dni, email: dataToUpdate.email }, id);

    await User.update(dataToUpdate, { where: { id, role: 'PROFESSOR' } });

    return { id, ...dataToUpdate };
  }

  async delete(id: any) {
    const professor: any = await User.findOne({ where: { id, role: 'PROFESSOR', active: true } });

    if (!professor) {
      return null;
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

    return true;
  }
}
