import { Level } from '../../models/index.js';

export class LevelService {
    async findAll() {
        return await Level.findAll();
    }
}