import { Classroom } from '../../models/index.js';

export class ClassroomService {
    async findAll() {
        return await Classroom.findAll();
    }
    async create(data: { name: string; capacity: number }) {
        return await Classroom.create(data);
    }
    async update(id: number, data: { name?: string; capacity?: number }) {
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return null;
        }
        return await classroom.update(data);
    }
}