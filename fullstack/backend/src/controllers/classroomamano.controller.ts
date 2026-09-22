import { type Request, type Response } from "express";
import { Classroomamano } from "../models/index.js";

export const getAllClassroomamano = async (req: Request, res: Response): Promise<void> => {
    try {
        const classroomamanos = await Classroomamano.findAll({ where: { active: true } });
        res.status(200).json({ status: 'ok', data: classroomamanos });
    } catch (error: any) {
        console.error('Error fetching classroomamano:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error', data: [] });
    }
};

export const createClassroomamano = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, capacity } = req.body;

        //validacion de campos obligatorios
        if (!name || capacity === undefined) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }

        //validacion de tipo y valores logicos
        if (typeof capacity !== 'number' || capacity <= 0) {
            res.status(400).json({ status: 'error', message: 'Capacity must be a positive number' });
            return;
        }
        if (typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid classroom name' });
            return;
        }

        const newClassroomamano: any = await Classroomamano.create({
            name: name.trim(),
            capacity,
        })
        res.status(201).json({ status: 'ok', message: 'Classroom created successfully', data: newClassroomamano });

    } catch (error: any) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
};



export const updateClassroomamano = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_ } = req.params;
        const { name, capacity } = req.body;

        const existingClassroomamano = await Classroomamano.findOne({ where: { id: id_ } });

        //validacion de campos obligatorios
        if (!name || capacity === undefined) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }

        //validacion de tipo y valores logicos
        if (typeof capacity !== 'number' || capacity <= 0) {
            res.status(400).json({ status: 'error', message: 'Capacity must be a positive number' });
            return;
        }
        if (typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid classroom name' });
            return;
        }

        if (!existingClassroomamano) {
            res.status(404).json({ status: 'error', message: 'Classroomamano not found' });
            return;
        }

        await Classroomamano.update({
            name: name.trim(),
            capacity
        }, {
            where: { id: id_ }
        });
        res.status(200).json({ status: 'ok', message: 'Classroomamano updated successfully' });
    } catch (error: any) {
        console.error('Error updating classroomamano:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
};

export const deleteClassroomamano = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_ } = req.params;
        const existingClassroomamano = await Classroomamano.findOne({ where: { id: id_, active: true } });

        if (!existingClassroomamano) {
            res.status(404).json({ status: 'error', message: 'Classroomamano not found' });
            return;
        }

        await Classroomamano.update(
            { active: false },
            { where: { id: id_ } }
        );


    } catch (error: any) {
        console.error('Error deactivating classroomamano:', error);
        res.status(500).json({ status: 'db_error', message: 'Internal error' });
    }
};