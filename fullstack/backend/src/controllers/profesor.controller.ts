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

export const checkProfesorDni = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    
    // Primero, buscamos si hay uno activo
    let prof: any = await user.findOne({ where: { dni, tipo: 'PROFESOR', activo: true } });
    if (prof) {
      res.status(200).json({ status: 'ok', data: prof });
      return;
    }

    // Segundo, buscamos si hay uno inactivo
    prof = await user.findOne({
      where: {
        dni: { [Op.like]: `${dni}_baja_%` },
        tipo: 'PROFESOR',
        activo: false
      }
    });

    if (prof) {
      res.status(200).json({ status: 'ok', data: prof });
      return;
    }

    res.status(200).json({ status: 'not_found', data: null });
  } catch (error: any) {
    console.error('Error al chequear DNI de profesor:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: null });
  }
};

export const createProfesor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni, nombre, apellido, telefono, email, fecha_nacimiento } = req.body;

    if (!dni || !nombre || !apellido) {
      res.status(400).json({ status: 'error', mensaje: 'DNI, Nombre y Apellido son obligatorios', data: null });
      return;
    }

    const profesorExistenteActivo: any = await user.findOne({ where: { dni, activo: true } });
    if (profesorExistenteActivo) {
      res.status(409).json({ status: 'error', mensaje: 'Ya existe un usuario con el DNI ' + dni, data: null });
      return;
    }

    const profesorInactivo: any = await user.findOne({
      where: {
        dni: { [Op.like]: `${dni}_baja_%` },
        tipo: 'PROFESOR',
        activo: false
      }
    });

    if (profesorInactivo) {
      await profesorInactivo.update({
        nombre,
        apellido,
        telefono,
        email,
        fecha_nacimiento,
        dni,
        usuario: dni,
        activo: true
      });
      res.status(201).json({ status: 'ok', mensaje: 'Profesor reactivado con éxito', data: profesorInactivo });
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
    const { id } = req.params;
    const { dni, nombre, apellido, telefono, email, fecha_nacimiento, activo } = req.body;

    const profesorExistente = await user.findOne({ where: { id, tipo: 'PROFESOR' } });
    if (!profesorExistente) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró el profesor con ID ' + id, data: null });
      return;
    }

    const datosAActualizar: any = {};
    if (dni !== undefined) datosAActualizar.dni = dni;
    if (nombre !== undefined) datosAActualizar.nombre = nombre;
    if (apellido !== undefined) datosAActualizar.apellido = apellido;
    if (telefono !== undefined) datosAActualizar.telefono = telefono;
    if (email !== undefined) datosAActualizar.email = email;
    if (fecha_nacimiento !== undefined) datosAActualizar.fecha_nacimiento = fecha_nacimiento;
    if (activo !== undefined) datosAActualizar.activo = activo; // Para poder pasarlo a Licencia/Inactivo sin darlo de baja lógica completa si se requiere

    await user.update(datosAActualizar, { where: { id, tipo: 'PROFESOR' } });

    res.status(200).json({ status: 'ok', mensaje: 'Profesor actualizado con éxito', data: { id, ...datosAActualizar } });
  } catch (error: any) {
    console.error('Error al actualizar profesor:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: null });
  }
};

export const deleteProfesor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const profesor: any = await user.findOne({ where: { id, tipo: 'PROFESOR', activo: true } });
    
    if (!profesor) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró un profesor activo con ID ' + id, data: null });
      return;
    }

    const ts = Date.now();
    await user.update(
      { 
        activo: false,
        email: profesor.email ? `${profesor.email}_baja_${ts}` : null,
        usuario: `${profesor.usuario}_baja_${ts}`,
        dni: `${profesor.dni}_baja_${ts}`
      },
      { where: { id, tipo: 'PROFESOR', activo: true } }
    );
    
    res.status(200).json({ status: 'ok', mensaje: 'Profesor dado de baja con éxito', data: null });
  } catch (error: any) {
    console.error('Error al dar de baja al profesor:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: null });
  }
};
