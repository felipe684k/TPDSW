import { Op } from 'sequelize';
import { Classroom } from '../../models/index.js';

export class ClassroomError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'ClassroomError';
        this.statusCode = statusCode;
    }
}

export class ClassroomService {
    // Evita aulas con el mismo nombre (MySQL compara sin distinguir mayúsculas)
    private async assertNameAvailable(name: any, excludeId?: number) {
        const cleanName = String(name ?? '').trim();
        const where: any = { name: cleanName };
        if (excludeId !== undefined) where.id = { [Op.ne]: excludeId };

        const duplicate = await Classroom.findOne({ where });
        if (duplicate) {
            throw new ClassroomError(`Ya existe un aula con el nombre "${cleanName}"`, 409);
        }
        return cleanName;
    }

    async findAll() {
        return await Classroom.findAll();
    }
    async create(data: { name: string; capacity: number }) {
        const name = await this.assertNameAvailable(data.name);
        return await Classroom.create({ ...data, name });
    }
    async update(id: number, data: { name?: string; capacity?: number }) {
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return null;
        }
        if (data.name !== undefined) {
            data = { ...data, name: await this.assertNameAvailable(data.name, id) };
        }
        return await classroom.update(data);
    }
}
