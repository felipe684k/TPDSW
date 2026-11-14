import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../../models/user.js';
import { sequelize, Level, UserLevel, Enrollment, Section, Course, AcademicYear, CURRENT_LEVEL_ORDER } from '../../models/index.js';
import { ENROLLMENT_STATUS } from '../../constants.js';
import { todayLocalDate } from '../../utils/date.js';

export class UserError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'UserError';
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

// Roles que pueden iniciar sesión
export const LOGIN_ROLES = ['ADMIN', 'STUDENT'];

// Un email vacío se guarda como NULL: la columna es UNIQUE y MySQL acepta varios NULL, pero no varios ''
export function normalizeEmail(email: any): string | null {
  const clean = typeof email === 'string' ? email.trim() : '';
  return clean === '' ? null : clean;
}

// Genera un username libre a partir del nombre: "juan", "juan2", "juan3"...
export async function generateUniqueUsername(base: string, excludeId?: number | string): Promise<string> {
  const cleanBase = base.toLowerCase().trim() || 'usuario';
  let candidate = cleanBase;
  let suffix = 2;
  while (true) {
    const where: any = { username: candidate };
    if (excludeId !== undefined) where.id = { [Op.ne]: excludeId };
    const taken = await User.findOne({ where });
    if (!taken) return candidate;
    candidate = `${cleanBase}${suffix++}`;
  }
}

// Verifica que DNI y email no estén usados por otro usuario
export async function assertUniqueUserFields(
  fields: { dni?: string; email?: string | null; username?: string },
  excludeId?: number | string
) {
  const notMe = excludeId !== undefined ? { id: { [Op.ne]: excludeId } } : {};

  if (fields.username) {
    const usernameTaken = await User.findOne({ where: { username: fields.username, ...notMe } });
    if (usernameTaken) throw new UserError('Ya existe un usuario con el nombre de usuario: ' + fields.username, 409);
  }

  if (fields.dni) {
    const dniTaken = await User.findOne({ where: { dni: fields.dni, ...notMe } });
    if (dniTaken) throw new UserError('Ya existe un usuario activo con el DNI: ' + fields.dni, 409);
  }
  if (fields.email) {
    const emailTaken = await User.findOne({ where: { email: fields.email, ...notMe } });
    if (emailTaken) throw new UserError('Ya existe un usuario con el email: ' + fields.email, 409);
  }
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
            ORDER BY start_date DESC, level_code DESC
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
      order: CURRENT_LEVEL_ORDER
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
      include: [{ model: Level, as: 'levels' }],
      order: CURRENT_LEVEL_ORDER
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
      include: [{ model: Level, as: 'levels' }],
      order: CURRENT_LEVEL_ORDER
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

    const cleanInput = username.trim();

    let foundUser: any = await User.scope('withPassword').findOne({
      where: {
        [Op.or]: [
          { username: cleanInput },
          { dni: cleanInput },
          { email: cleanInput }
        ],
        active: true
      }
    });

    // Si no se encontró por username/DNI/email exacto, verificamos si coincide con el nombre de un profesor activo
    if (!foundUser) {
      foundUser = await User.scope('withPassword').findOne({
        where: {
          role: 'PROFESSOR',
          active: true,
          [Op.and]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('first_name')), cleanInput.toLowerCase())
          ]
        }
      });
    }

    if (!foundUser) {
      throw new UserError('Usuario o contraseña incorrectos', 401);
    }

    // Si el usuario es profesor, bloqueamos el ingreso con mensaje explícito de su rol
    if (foundUser.role === 'PROFESSOR') {
      throw new UserError('No podés ingresar al sistema porque sos profesor. El acceso está habilitado únicamente para Administración y Alumnos.', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password).catch(() => false);

    if (!isPasswordValid) {
      throw new UserError('Usuario o contraseña incorrectos', 401);
    }

    // Solo la secretaría (ADMIN) y los alumnos (STUDENT) tienen acceso al sistema
    if (!LOGIN_ROLES.includes(foundUser.role)) {
      throw new UserError('Tu usuario no tiene acceso al sistema', 403);
    }

    const userData = foundUser.toJSON();
    delete userData.password;

    return userData;
  }

  async findById(id: number | string) {
    const foundUser: any = await User.findOne({
      where: {
        id: id,
        role: 'STUDENT'
      },
      include: [
        { model: Level, as: 'levels' },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            {
              model: Section,
              as: 'section',
              include: [
                {
                  model: Course,
                  as: 'course',
                  include: [{ model: Level, as: 'level' }]
                },
                { model: AcademicYear, as: 'academic_year' }
              ]
            }
          ]
        }
      ]
    });

    if (!foundUser) {
      throw new UserError('No se encontró un alumno con ID: ' + id, 404);
    }

    const plain = typeof foundUser.toJSON === 'function' ? foundUser.toJSON() : foundUser;
    if (Array.isArray(plain.levels) && plain.levels.length > 0) {
      const sortedLevels = [...plain.levels].sort((a: any, b: any) => {
        const dateA = a.UserLevel?.start_date ? new Date(a.UserLevel.start_date).getTime() : 0;
        const dateB = b.UserLevel?.start_date ? new Date(b.UserLevel.start_date).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return Number(b.level_code) - Number(a.level_code);
      });
      plain.current_level = sortedLevels[0];
      plain.level_code = String(sortedLevels[0].level_code);
    } else {
      plain.current_level = null;
      plain.level_code = '';
    }

    return plain;
  }

  async create(data: CreateUserDto) {
    const { dni, first_name, last_name, phone, birth_date, email, level_code } = data;

    if (!dni || !first_name || !last_name) {
      throw new UserError('Faltan campos obligatorios', 400);
    }

    const cleanEmail = normalizeEmail(email);
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

    // El alumno reactivado se excluye para no chocar consigo mismo
    await assertUniqueUserFields({ email: cleanEmail }, inactiveUser?.id);
    const username = await generateUniqueUsername(first_name, inactiveUser?.id);

    if (inactiveUser) {
      await inactiveUser.update({
        first_name,
        last_name,
        phone,
        birth_date,
        email: cleanEmail,
        username,
        password: hashedPassword,
        dni,
        active: true
      });

      if (level_code !== undefined) {
        await UserLevel.destroy({ where: { id_user: inactiveUser.id } });
        if (level_code !== '' && level_code !== null) {
          const actualDate = todayLocalDate();
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
      email: cleanEmail,
      username,
      password: hashedPassword,
      role: 'STUDENT',
      active: true
    });

    if (level_code) {
      const actualDate = todayLocalDate();
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
    if (email !== undefined) dataToUpdate.email = normalizeEmail(email);
    if (username !== undefined) dataToUpdate.username = username;
    if (password !== undefined && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await assertUniqueUserFields(
      { dni: dataToUpdate.dni, email: dataToUpdate.email, username: dataToUpdate.username },
      id
    );

    await User.update(dataToUpdate, { where: { id: id, role: 'STUDENT', active: true } });

    if (level_code !== undefined) {
      await UserLevel.destroy({ where: { id_user: id } });
      if (level_code !== '' && level_code !== null) {
        const actualDate = todayLocalDate();
        await UserLevel.create({ id_user: Number(id), level_code: Number(level_code), start_date: actualDate });
      }
    }

    const { password: _omitPassword, ...safeData } = dataToUpdate;
    return { dni, ...safeData, level_code };
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

    // Al dar de baja al alumno, también se dan de baja sus inscripciones vigentes
    await Enrollment.update(
      { status: ENROLLMENT_STATUS.DROPPED },
      { where: { id_user: id, status: { [Op.ne]: ENROLLMENT_STATUS.DROPPED } } }
    );

    return true;
  }
}
