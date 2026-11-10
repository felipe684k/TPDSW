import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../../models/user.js';
import { sequelize, Level, UserLevel } from '../../models/index.js';

export class UserError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'UserError';
    this.statusCode = statusCode;
  }
}

export interface CreateUserDto {
  dni: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  email?: string;
  level_code?: number | string;
}

export interface UpdateUserDto {
  dni?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  email?: string;
  username?: string;
  password?: string;
  level_code?: number | string;
}

export class UserService {
  async findAll(filters: { search?: any; level?: any } = {}) {
    const { search, level } = filters;

    let searchConditions: any = {
      role: 'STUDENT',
      active: true
    };

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

    if (level) {
      searchConditions = {
        ...searchConditions,
        [Op.and]: [
          sequelize.literal(`(
            SELECT level_code 
            FROM user_level 
            WHERE user_level.id_user = User.id 
            ORDER BY start_date DESC 
            LIMIT 1
          ) = ${sequelize.escape(level as string)}`)
        ]
      };
    }

    const users = await User.findAll({
      where: searchConditions,
      include: [{
        model: Level,
        as: 'levels',
      }],
      order: [
        [{ model: Level, as: 'levels' }, UserLevel, 'start_date', 'DESC']
      ]
    });

    return users.map(u => {
      const data = u.toJSON();
      const lastLevel = data.levels && data.levels.length > 0 ? data.levels[0] : null;

      return {
        ...data,
        current_level: lastLevel ? lastLevel.name : 'Sin nivel asignado',
        level_code: lastLevel ? String(lastLevel.level_code) : '',
        levels: undefined
      };
    });
  }

  async checkStudentDni(dni: string) {
    // 1. Search active student
    let student: any = await User.findOne({
      where: { dni, role: 'STUDENT', active: true },
      include: [{ model: Level, as: 'levels' }]
    });

    if (student) {
      const data = student.toJSON();
      const lastLevel = data.levels && data.levels.length > 0 ? data.levels[0] : null;
      return {
        ...data,
        level_code: lastLevel ? String(lastLevel.level_code) : '',
        current_level: lastLevel ? lastLevel.name : 'Sin nivel asignado',
      };
    }

    // 2. Search inactive/deleted student
    student = await User.findOne({
      where: {
        dni: { [Op.like]: `${dni}_deleted_%` },
        role: 'STUDENT',
        active: false
      },
      include: [{ model: Level, as: 'levels' }]
    });

    if (student) {
      const data = student.toJSON();
      const lastLevel = data.levels && data.levels.length > 0 ? data.levels[0] : null;
      return {
        ...data,
        level_code: lastLevel ? String(lastLevel.level_code) : '',
        current_level: lastLevel ? lastLevel.name : 'Sin nivel asignado',
      };
    }

    return null;
  }

  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new UserError('Por favor ingresa usuario y contraseña', 400);
    }

    const foundUser: any = await User.findOne({
      where: {
        username: username,
        active: true
      }
    });

    if (!foundUser) {
      throw new UserError('Usuario o contraseña incorrectos', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password).catch(() => false)
      || (foundUser.password === password); // Soporte temporal por si la contraseña no estaba hasheada

    if (!isPasswordValid) {
      throw new UserError('Usuario o contraseña incorrectos', 401);
    }

    const userData = foundUser.toJSON();
    delete userData.password;

    return userData;
  }

  async findById(id: number | string) {
    const foundUser = await User.findOne({
      where: {
        id: id,
        role: 'STUDENT',
        active: true
      }
    });

    if (!foundUser) {
      throw new UserError('No se encontró un alumno activo con ID: ' + id, 404);
    }

    return foundUser;
  }

  async create(data: CreateUserDto) {
    const { dni, first_name, last_name, phone, birth_date, email, level_code } = data;

    if (!dni || !first_name || !last_name) {
      throw new UserError('Faltan campos obligatorios', 400);
    }

    const username = first_name.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(dni.toString(), 10);

    const activeExistingUser: any = await User.findOne({ where: { dni } });
    if (activeExistingUser) {
      throw new UserError('Ya existe un usuario activo con el DNI: ' + dni, 409);
    }

    const inactiveUser: any = await User.findOne({
      where: {
        dni: { [Op.like]: `${dni}_deleted_%` },
        role: 'STUDENT',
        active: false
      }
    });

    if (inactiveUser) {
      await inactiveUser.update({
        first_name,
        last_name,
        phone,
        birth_date,
        email,
        username,
        password: hashedPassword,
        dni,
        active: true
      });

      if (level_code !== undefined) {
        await UserLevel.destroy({ where: { id_user: inactiveUser.id } });
        if (level_code !== '' && level_code !== null) {
          const actualDate = new Date().toISOString().split('T')[0];
          await UserLevel.create({ id_user: inactiveUser.id, level_code: Number(level_code), start_date: actualDate });
        }
      }

      return { user: inactiveUser, reactivated: true };
    }

    const newUser = await User.create({
      dni,
      first_name,
      last_name,
      phone,
      birth_date,
      email,
      username,
      password: hashedPassword,
      role: 'STUDENT',
      active: true
    });

    if (level_code) {
      const actualDate = new Date().toISOString().split('T')[0];
      await UserLevel.create({ id_user: newUser.dataValues.id, level_code: Number(level_code), start_date: actualDate });
    }

    return { user: newUser, reactivated: false };
  }

  async update(id: number | string, data: UpdateUserDto) {
    const { dni, first_name, last_name, phone, birth_date, email, username, password, level_code } = data;

    const existingUser = await User.findOne({ where: { id: id, role: 'STUDENT', active: true } });
    if (!existingUser) {
      throw new UserError('No se encontró un alumno activo con ID ' + id, 404);
    }

    const dataToUpdate: any = {};
    if (dni !== undefined) dataToUpdate.dni = dni;
    if (first_name !== undefined) dataToUpdate.first_name = first_name;
    if (last_name !== undefined) dataToUpdate.last_name = last_name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (birth_date !== undefined) dataToUpdate.birth_date = birth_date;
    if (email !== undefined) dataToUpdate.email = email;
    if (username !== undefined) dataToUpdate.username = username;
    if (password !== undefined && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await User.update(dataToUpdate, { where: { id: id, role: 'STUDENT', active: true } });

    if (level_code !== undefined) {
      await UserLevel.destroy({ where: { id_user: id } });
      if (level_code !== '' && level_code !== null) {
        const actualDate = new Date().toISOString().split('T')[0];
        await UserLevel.create({ id_user: Number(id), level_code: Number(level_code), start_date: actualDate });
      }
    }

    return { dni, ...dataToUpdate, level_code };
  }

  async delete(id: number | string) {
    const student: any = await User.findOne({ where: { id: id, role: 'STUDENT', active: true } });
    if (!student) {
      throw new UserError('No se encontró un alumno activo con ID ' + id, 404);
    }

    const ts = Date.now();
    await User.update(
      {
        active: false,
        email: student.email ? `${student.email}_deleted_${ts}` : null,
        username: `${student.username}_deleted_${ts}`,
        dni: `${student.dni}_deleted_${ts}`
      },
      { where: { id: id, role: 'STUDENT', active: true } }
    );

    return true;
  }
}
