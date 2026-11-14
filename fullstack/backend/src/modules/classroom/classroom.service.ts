import { AppError } from '../../errors/AppError.js';
import { Op } from 'sequelize';
import { Classroom, Section } from '../../models/index.js';

/**
 * SERVICE DE AULAS
 *
 * Capa de lógica de negocio: valida las reglas y usa los modelos para leer y guardar en la base.
 * No usa req ni res: si algo no se puede hacer, lanza un error con su código HTTP.
 *
 * La capacidad del aula es el cupo de las comisiones que la usan.
 * Se elimina de verdad (borrado físico), pero solo si no tiene comisiones asignadas.
 */

// Error propio del módulo: hereda de AppError, así el errorHandler responde con su código
export class ClassroomError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'ClassroomError';
  }
}

export class ClassroomService {
    // Evita aulas con el mismo nombre (MySQL compara sin distinguir mayúsculas)
    private async assertNameAvailable(name: any, excludeId?: number) {
        const cleanName = String(name ?? '').trim();
        if (!cleanName) {
            throw new ClassroomError('El nombre del aula es obligatorio', 400);
        }
        const where: any = { name: cleanName };
        if (excludeId !== undefined) where.id = { [Op.ne]: excludeId };

        const duplicate = await Classroom.findOne({ where });
        if (duplicate) {
            throw new ClassroomError(`Ya existe un aula con el nombre "${cleanName}"`, 409);
        }
        return cleanName;
    }

    // La capacidad tiene que ser un número entero mayor a 0
    private assertValidCapacity(capacity: any) {
        const value = Number(capacity);
        if (!Number.isInteger(value) || value <= 0) {
            throw new ClassroomError('La capacidad debe ser un número entero mayor a 0', 400);
        }
    }

    // ─── CRUD ───

    // Lista todas las aulas
    async findAll() {
        return await Classroom.findAll();
    }
    // Crea un aula validando capacidad y nombre
    async create(data: { name: string; capacity: number }) {
        this.assertValidCapacity(data.capacity);
        const name = await this.assertNameAvailable(data.name);
        return await Classroom.create({ ...data, name });
    }
    // Edita un aula (null si no existe, y el controller responde 404)
    async update(id: number, data: { name?: string; capacity?: number }) {
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return null;
        }
        if (data.capacity !== undefined) {
            this.assertValidCapacity(data.capacity);
        }
        if (data.name !== undefined) {
            data = { ...data, name: await this.assertNameAvailable(data.name, id) };
        }
        return await classroom.update(data);
    }
    // Elimina un aula si no tiene comisiones asignadas
    async delete(id: number) {
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return null;
        }

        const sectionsCount = await Section.count({ where: { id_classroom: id } });
        if (sectionsCount > 0) {
            throw new ClassroomError(
                'No se puede eliminar el aula porque tiene comisiones asignadas',
                409
            );
        }

        await classroom.destroy();
        return classroom;
    }
}
