import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../../models/user.js';
import { sequelize, Level, UserLevel, Enrollment, Section, Course, AcademicYear, CURRENT_LEVEL_ORDER } from '../../models/index.js';
import { ENROLLMENT_STATUS } from '../../constants.js';
import { todayLocalDate } from '../../utils/date.js';

/**
 * SERVICE DE USUARIOS / ALUMNOS
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un UserError con su código.
 *
 * Maneja el login y el CRUD de alumnos. Algunas funciones (normalizeEmail, assertValidDniAndEmail,
 * assertUniqueUserFields) se exportan porque también las usa el service de docentes:
 * alumnos y docentes están en la misma tabla user.
 *
 * Bajas: son lógicas. Al DNI, email y username se les agrega "_deleted_<fecha>" para liberarlos;
 * si se vuelve a cargar el mismo DNI, se reactiva el registro original (y se conserva su historial).
 */

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class UserError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'UserError';
  }
}

// DTOs: forma de los datos que llegan del front para crear y para editar un alumno
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

// ─── HELPERS (también los usa el service de docentes) ───

// Roles que pueden iniciar sesión
export const LOGIN_ROLES = ['ADMIN', 'STUDENT'];

// Un email vacío se guarda como NULL: la columna es UNIQUE y MySQL acepta varios NULL, pero no varios ''
export function normalizeEmail(email: any): string | null {
  const clean = typeof email === 'string' ? email.trim() : '';
  return clean === '' ? null : clean;
}

// Formato de DNI (7 u 8 números, sin puntos) y de email (texto@texto.dominio). Solo valida lo que se envía.
export function assertValidDniAndEmail(dni?: any, email?: string | null) {
  if (dni !== undefined && !/^\d{7,8}$/.test(String(dni))) {
    throw new UserError('El DNI debe tener 7 u 8 números, sin puntos ni espacios', 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UserError('El email no tiene un formato válido (ej. nombre@email.com)', 400);
  }
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

// Verifica que DNI, email y username no estén usados por otro usuario (409 si ya existen).
// excludeId: al editar, se excluye al propio usuario (Op.ne = "distinto de") para que no choque consigo mismo.
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
  // ─── CONSULTAS ───

  // Listado de alumnos activos, con búsqueda por DNI, nombre o apellido (LIKE = "contiene")
  // y filtro por nivel actual. A cada alumno se le agrega su nivel actual (current_level).
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

    // Filtro por nivel ACTUAL: una subconsulta SQL busca el último nivel de cada alumno y lo compara.
    // sequelize.escape evita inyección SQL al meter el valor que vino del front.
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

  // Busca un alumno por DNI: primero entre los activos y, si no está, entre los dados de baja.
  // El front lo usa al cargar un alumno nuevo para ofrecer reactivar uno dado de baja.
  async checkStudentDni(dni: string) {
    // 1. Buscar alumno activo
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

    // 2. Buscar alumno dado de baja (su DNI quedó guardado como "<dni>_deleted_<fecha>")
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

  // ─── LOGIN ───

  /**
   * Inicio de sesión. Busca un usuario activo por username, DNI o email y compara la contraseña
   * con bcrypt.compare (la guardada está encriptada, por eso no se compara con ===).
   * Solo pueden entrar ADMIN y STUDENT; los docentes reciben un 403.
   * Devuelve los datos del usuario sin la contraseña.
   */
  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new UserError('Por favor ingresa usuario y contraseña', 400);
    }

    const cleanInput = username.trim();

    // scope('withPassword'): por defecto el modelo nunca trae la contraseña; acá se pide explícitamente
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

  // Detalle de un alumno con su historial de niveles y sus cursadas (404 si no existe)
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

    // Nivel actual: el más reciente del historial (y si hay dos de la misma fecha, el más avanzado)
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

  // ─── ALTA, EDICIÓN Y BAJA ───

  /**
   * Crea un alumno. Si ya existía uno dado de baja con ese DNI, lo reactiva con los datos nuevos.
   * La contraseña inicial es su DNI (encriptada con bcrypt) y el username se genera con su nombre.
   * level_code: último nivel aprobado (opcional); si no tiene, empieza en A1.
   */
  async create(data: CreateUserDto) {
    const { dni, first_name, last_name, phone, birth_date, email, level_code } = data;

    if (!dni || !first_name || !last_name) {
      throw new UserError('Faltan campos obligatorios', 400);
    }

    const cleanEmail = normalizeEmail(email);
    assertValidDniAndEmail(dni, cleanEmail);
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

    // Alumno y nivel se guardan juntos: si falla uno, no se guarda ninguno
    const t = await sequelize.transaction();
    try {
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
        }, { transaction: t });

        if (level_code !== undefined) {
          await UserLevel.destroy({ where: { id_user: inactiveUser.id }, transaction: t });
          if (level_code !== '' && level_code !== null) {
            const actualDate = todayLocalDate();
            await UserLevel.create({ id_user: inactiveUser.id, level_code: Number(level_code), start_date: actualDate }, { transaction: t });
          }
        }

        await t.commit();
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
      }, { transaction: t });

      if (level_code) {
        const actualDate = todayLocalDate();
        await UserLevel.create({ id_user: newUser.dataValues.id, level_code: Number(level_code), start_date: actualDate }, { transaction: t });
      }

      await t.commit();
      return { user: newUser, reactivated: false };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Edita un alumno: solo se actualizan los campos que se enviaron. Si se envía level_code,
  // se reemplaza su último nivel aprobado (es una corrección manual de la Secretaría).
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

    assertValidDniAndEmail(dataToUpdate.dni, dataToUpdate.email);
    await assertUniqueUserFields(
      { dni: dataToUpdate.dni, email: dataToUpdate.email, username: dataToUpdate.username },
      id
    );

    // Datos y nivel se guardan juntos: así nunca se borra el nivel sin crear el nuevo
    const t = await sequelize.transaction();
    try {
      await User.update(dataToUpdate, { where: { id: id, role: 'STUDENT', active: true }, transaction: t });

      if (level_code !== undefined) {
        await UserLevel.destroy({ where: { id_user: id }, transaction: t });
        if (level_code !== '' && level_code !== null) {
          const actualDate = todayLocalDate();
          await UserLevel.create({ id_user: Number(id), level_code: Number(level_code), start_date: actualDate }, { transaction: t });
        }
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    const { password: _omitPassword, ...safeData } = dataToUpdate;
    return { dni, ...safeData, level_code };
  }

  // Baja lógica del alumno: se libera su DNI, email y username con el sufijo "_deleted_<fecha>"
  // y se dan de baja sus inscripciones activas, todo en una transacción
  async delete(id: number | string) {
    const student: any = await User.findOne({ where: { id: id, role: 'STUDENT', active: true } });
    if (!student) {
      throw new UserError('No se encontró un alumno activo con ID ' + id, 404);
    }

    const ts = Date.now();
    // Baja del alumno y de sus inscripciones juntas: si falla una, no se aplica ninguna
    const t = await sequelize.transaction();
    try {
      await User.update(
        {
          active: false,
          email: student.email ? `${student.email}_deleted_${ts}` : null,
          username: `${student.username}_deleted_${ts}`,
          dni: `${student.dni}_deleted_${ts}`
        },
        { where: { id: id, role: 'STUDENT', active: true }, transaction: t }
      );

      // Al dar de baja al alumno, también se dan de baja sus inscripciones vigentes
      await Enrollment.update(
        { status: ENROLLMENT_STATUS.DROPPED },
        { where: { id_user: id, status: { [Op.ne]: ENROLLMENT_STATUS.DROPPED } }, transaction: t }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    return true;
  }
}
