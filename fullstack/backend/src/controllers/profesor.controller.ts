import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { user } from '../models/user.js';

export const getAllProfesores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, estado } = req.query;

    let condicionesDeBusqueda: any = {
      tipo: 'PROFESOR'
    };

    if (estado === 'Activo') {
      condicionesDeBusqueda.activo = true;
    } else if (estado === 'Licencia' || estado === 'Inactivo') {
      condicionesDeBusqueda.activo = false;
    }

    if (search) {
      condicionesDeBusqueda = {
        ...condicionesDeBusqueda,
        [Op.or]: [
          { dni: { [Op.like]: "%" + search + "%" } },
          { nombre: { [Op.like]: "%" + search + "%" } },
          { apellido: { [Op.like]: "%" + search + "%" } }
        ]
      };
    }

    const profesores = await user.findAll({
      where: condicionesDeBusqueda,
      order: [['apellido', 'ASC']]
    });

    res.status(200).json({ status: 'ok', mensaje: 'Docentes obtenidos con éxito', data: profesores });
  } catch (error: any) {
    console.error('Error al consultar profesores:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: [] });
  }
};

export const createProfesor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni, nombre, apellido, telefono, email, fecha_nacimiento } = req.body;

    if (!dni || !nombre || !apellido) {
      res.status(400).json({ status: 'error', mensaje: 'DNI, Nombre y Apellido son obligatorios', data: null });
      return;
    }

    const profesorExistente: any = await user.findOne({ where: { dni } });
    if (profesorExistente) {
      if (!profesorExistente.activo) {
        await user.update(
          { nombre, apellido, telefono, email, fecha_nacimiento, tipo: 'PROFESOR', activo: true },
          { where: { dni } }
        );
        res.status(200).json({ status: 'ok', mensaje: 'Profesor reactivado con éxito', data: profesorExistente });
        return;
      }
      res.status(409).json({ status: 'error', mensaje: 'Ya existe un usuario con el DNI ' + dni, data: null });
      return;
    }

    const nuevoProfesor = await user.create({
      dni, 
      nombre, 
      apellido, 
      telefono, 
      email, 
      fecha_nacimiento,
      usuario: dni, // Por defecto el usuario es el DNI
      contrasena: dni, // Por defecto la contraseña es el DNI
      tipo: 'PROFESOR', 
      activo: true 
    });

    res.status(201).json({ status: 'ok', mensaje: 'Profesor registrado con éxito', data: nuevoProfesor });
  } catch (error: any) {
    console.error('Error al registrar profesor:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno del servidor', data: null });
  }
};

export const updateProfesor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    const { nombre, apellido, telefono, email, fecha_nacimiento, activo } = req.body;

    const profesorExistente = await user.findOne({ where: { dni, tipo: 'PROFESOR' } });
    if (!profesorExistente) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró el profesor con DNI ' + dni, data: null });
      return;
    }

    const datosAActualizar: any = {};
    if (nombre !== undefined) datosAActualizar.nombre = nombre;
    if (apellido !== undefined) datosAActualizar.apellido = apellido;
    if (telefono !== undefined) datosAActualizar.telefono = telefono;
    if (email !== undefined) datosAActualizar.email = email;
    if (fecha_nacimiento !== undefined) datosAActualizar.fecha_nacimiento = fecha_nacimiento;
    if (activo !== undefined) datosAActualizar.activo = activo; // Para poder pasarlo a Licencia/Inactivo sin darlo de baja lógica completa si se requiere

    await user.update(datosAActualizar, { where: { dni, tipo: 'PROFESOR' } });

    res.status(200).json({ status: 'ok', mensaje: 'Profesor actualizado con éxito', data: { dni, ...datosAActualizar } });
  } catch (error: any) {
    console.error('Error al actualizar profesor:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: null });
  }
};

export const deleteProfesor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    
    const profesor: any = await user.findOne({ where: { dni, tipo: 'PROFESOR', activo: true } });
    
    if (!profesor) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró un profesor activo con DNI ' + dni, data: null });
      return;
    }

    const ts = Date.now();
    await user.update(
      { 
        activo: false,
        email: profesor.email ? `${profesor.email}_baja_${ts}` : null,
        usuario: `${profesor.usuario}_baja_${ts}`
      },
      { where: { dni, tipo: 'PROFESOR', activo: true } }
    );
    
    res.status(200).json({ status: 'ok', mensaje: 'Profesor dado de baja con éxito', data: null });
  } catch (error: any) {
    console.error('Error al dar de baja al profesor:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: null });
  }
};
