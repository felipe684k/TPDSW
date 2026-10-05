import { Level } from '../models/index.js';

export const getAllLevelsService = async () => {
  return await Level.findAll();
};
