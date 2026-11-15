import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { AppError } from '../../errors/AppError.js';
import { User } from '../../models/user.js';
import { sequelize, UserSection } from '../../models/index.js';
import { normalizeEmail, assertUniqueUserFields, assertValidDniAndEmail } from '../user/user.service.js';

export class ProfessorError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'ProfessorError';
  }
}

/**
 * SERVICE DE DOCENTES
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un error con su código HTTP.
 *
 * Los docentes se guardan en la misma tabla que los alumnos (user) con role = PROFESSOR,
 * por eso usa las validaciones compartidas de user.service (DNI, email, campos únicos).
 * Los docentes no pueden iniciar sesión. La baja es lógica y, si se vuelve a cargar
 * el mismo DNI, se reactiva el registro original.
 */
export class ProfessorService {
  // ─── CONSULTAS ───

  // Listado de docentes, con búsqueda y filtro por estado (activos / inactivos)
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

  // Busca un docente por DNI (activo o dado de baja) para avisar o reactivarlo desde el front
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

  // ─── ALTA, EDICIÓN Y BAJA ───

  // Crea un docente, o reactiva uno dado de baja con el mismo DNI.
  // Si ya hay un usuario activo con ese DNI devuelve conflict: true y el controller responde 409.
  async create(data: {
    dni: any;
    first_name: any;
    last_name: any;
    phone: any;
    email: any;
    birth_date: any;
  }) {
    const { dni, first_name, last_name, phone, email, birth_date } = data;
    assertValidDniAndEmail(dni, normalizeEmail(email));

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

    // Email vacío -> NULL, y ni email ni username (igual al DNI) pueden estar usados por otro usuario
    const cleanEmail = normalizeEmail(email);
    await assertUniqueUserFields(
      { dni: String(dni), email: cleanEmail, username: String(dni) },
      inactiveProfessor?.id
    );

    if (inactiveProfessor) {
      await inactiveProfessor.update({
        first_name,
        last_name,
        phone,
        email: cleanEmail,
        birth_date,
        dni,
        username: String(dni),
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
      username: String(dni),
      // Los docentes no inician sesión, pero la clave nunca se guarda en texto plano
      password: await bcrypt.hash(String(dni), 10),
      role: 'PROFESSOR',
      active: true
    });

    return { conflict: false, reactivated: false, data: newProfessor };
  }

  // Edita un docente activo: solo se cambian los campos que se enviaron (null si no existe o está inactivo)
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

    const existingProfessor = await User.findOne({ where: { id, role: 'PROFESSOR', active: true } });
    if (!existingProfessor) {
      return null;
    }

    const dataToUpdate: any = {};
    if (dni !== undefined) {
      dataToUpdate.dni = dni;
      dataToUpdate.username = String(dni);
    }
    if (first_name !== undefined) dataToUpdate.first_name = first_name;
    if (last_name !== undefined) dataToUpdate.last_name = last_name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (email !== undefined) dataToUpdate.email = normalizeEmail(email);
    if (birth_date !== undefined) dataToUpdate.birth_date = birth_date;
    if (active !== undefined) dataToUpdate.active = active;

    assertValidDniAndEmail(dataToUpdate.dni, dataToUpdate.email);
    await assertUniqueUserFields(
      { dni: dataToUpdate.dni, email: dataToUpdate.email, username: dataToUpdate.username },
      id
    );

    await User.update(dataToUpdate, { where: { id, role: 'PROFESSOR', active: true } });

    return { id, ...dataToUpdate };
  }

  // Baja lógica: bloquea si tiene comisiones asignadas (409) y ejecuta la baja en una transacción
  async delete(id: any) {
    const professor: any = await User.findOne({ where: { id, role: 'PROFESSOR', active: true } });

    if (!professor) {
      return null;
    }

    const ts = Date.now();
    const t = await sequelize.transaction();
    try {
      const assignedSectionsCount = await UserSection.count({
        where: { id_user: id },
        transaction: t
      });

      if (assignedSectionsCount > 0) {
        throw new ProfessorError(
          'No se puede desactivar el profesor porque tiene comisiones asignadas. Reasigná otro docente a sus comisiones antes de darlo de baja.',
          409
        );
      }

      await User.update(
        {
          active: false,
          email: professor.email ? `${professor.email}_deleted_${ts}` : null,
          username: `${professor.username}_deleted_${ts}`,
          dni: `${professor.dni}_deleted_${ts}`
        },
        { where: { id, role: 'PROFESSOR', active: true }, transaction: t }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    return true;
  }
}
