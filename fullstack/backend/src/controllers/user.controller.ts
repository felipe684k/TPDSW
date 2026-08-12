import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { user } from '../models/user.js';
import { sequelize, Nivel, UsuarioNivel } from '../models/index.js';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, nivel } = req.query;

    // BAJA LÓGICA: Filtramos por defecto solo los usuarios con activo: true (alumnos vigentes)
    let condicionesDeBusqueda: any = {
      tipo: 'ALUMNO',
      activo: true
    };

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

    if (nivel) {
      condicionesDeBusqueda = {
        ...condicionesDeBusqueda,
        [Op.and]: [
          sequelize.literal(`(
            SELECT codigo_nivel 
            FROM usuario_nivel 
            WHERE usuario_nivel.dni = Usuario.dni 
            ORDER BY fecha_desde DESC 
            LIMIT 1
          ) = ${sequelize.escape(nivel as string)}`) 
        ]
      };
    }

    const users = await user.findAll({
      where: condicionesDeBusqueda,
      include: [{
        model: Nivel,
        as: 'niveles',
      }],
      order: [
        [{ model: Nivel, as: 'niveles' }, UsuarioNivel, 'fecha_desde', 'DESC']
      ]
    });

    const usuariosLimpios = users.map(u => {
      const datos = u.toJSON();
      const ultimoNivel = datos.niveles && datos.niveles.length > 0 ? datos.niveles[0] : null;
      
      return {
        ...datos,
        nivel_actual: ultimoNivel ? ultimoNivel.nombre : 'Sin Nivel Asignado',
        niveles: undefined 
      };
    });

    res.status(200).json({ status: 'ok', mensaje: 'Lista obtenida con éxito', data: usuariosLimpios });

  } catch (error: any) {
    console.error('Error al consultar usuarios:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: [] });
  }
};

export const getUserByDni = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    // BAJA LÓGICA: Solo buscamos el alumno si se encuentra activo
    const usuarioEncontrado = await user.findOne({
      where: {
        dni: dni,
        tipo: 'ALUMNO',
        activo: true
      }
    });
    if (!usuarioEncontrado) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró ningún alumno activo con el DNI: ' + dni, data: null });
      return;
    }
    res.status(200).json({ status: 'ok', mensaje: 'Alumno encontrado con éxito', data: usuarioEncontrado });
  } catch (error: any) {
    console.error('Error al buscar el alumno con DNI ' + req.params.dni + ':', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno del servidor al buscar el alumno', data: null });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni, nombre, apellido, telefono, fecha_nacimiento, email, usuario, contrasena, codigo_nivel } = req.body;

    if (!dni || !nombre || !apellido || !usuario || !contrasena) {
      res.status(400).json({ status: 'error', mensaje: 'Faltan campos obligatorios', data: null });
      return;
    }

    const usuarioExistente: any = await user.findOne({ where: { dni } });
    if (usuarioExistente) {
      // BAJA LÓGICA: Si el usuario existía pero estaba inactivo, se puede reactivar
      if (!usuarioExistente.activo) {
        await user.update(
          { nombre, apellido, telefono, fecha_nacimiento, email, usuario, contrasena, tipo: 'ALUMNO', activo: true },
          { where: { dni } }
        );
        if (codigo_nivel) {
          const fechaActual = new Date().toISOString().split('T')[0];
          await UsuarioNivel.create({ dni: dni, codigo_nivel: codigo_nivel, fecha_desde: fechaActual });
        }
        res.status(200).json({ status: 'ok', mensaje: 'Alumno reactivado con éxito', data: usuarioExistente });
        return;
      }
      res.status(409).json({ status: 'error', mensaje: 'Ya existe un usuario activo con el DNI ' + dni, data: null });
      return;
    }

    // BAJA LÓGICA: Al crear un usuario nuevo, la propiedad 'activo' se establece en true por defecto
    const nuevoUsuario = await user.create({
      dni, nombre, apellido, telefono, fecha_nacimiento, email, usuario, contrasena, tipo: 'ALUMNO', activo: true 
    });

    if (codigo_nivel) {
      const fechaActual = new Date().toISOString().split('T')[0];
      await UsuarioNivel.create({ dni: dni, codigo_nivel: codigo_nivel, fecha_desde: fechaActual });
    }

    res.status(201).json({ status: 'ok', mensaje: 'Alumno creado con éxito', data: nuevoUsuario });
  } catch (error: any) {
    console.error('Error al crear el alumno:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno del servidor', data: null });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    const { nombre, apellido, telefono, fecha_nacimiento, email, usuario, contrasena, codigo_nivel } = req.body;

    // BAJA LÓGICA: Solo permitimos modificar alumnos que permanezcan activos
    const usuarioExistente = await user.findOne({ where: { dni: dni, tipo: 'ALUMNO', activo: true } });
    if (!usuarioExistente) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró un alumno activo con DNI ' + dni, data: null });
      return;
    }

    await user.update({ nombre, apellido, telefono, fecha_nacimiento, email, usuario, contrasena }, { where: { dni: dni, tipo: 'ALUMNO', activo: true } });

    if (codigo_nivel) {
       await UsuarioNivel.destroy({ where: { dni: dni } });
       const fechaActual = new Date().toISOString().split('T')[0];
       await UsuarioNivel.create({ dni: dni, codigo_nivel: codigo_nivel, fecha_desde: fechaActual });
    }

    res.status(200).json({ status: 'ok', mensaje: 'Alumno actualizado con éxito', data: { dni, nombre, apellido } });
  } catch (error: any) {
    console.error('Error al actualizar el alumno:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno del servidor', data: null });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dni } = req.params;
    
    // BAJA LÓGICA: En lugar de usar destroy() y borrar los registros físicamente de las tablas 
    // ('usuario' y 'usuario_nivel'), actualizamos el campo 'activo' a false.
    // Esto mantiene intacto todo el historial del alumno (inscripciones, pagos, notas).
    const [filasAfectadas] = await user.update(
      { activo: false },
      { where: { dni: dni, tipo: 'ALUMNO', activo: true } }
    );
    
    if (filasAfectadas === 0) {
      res.status(404).json({ status: 'error', mensaje: 'No se encontró un alumno activo con DNI ' + dni, data: null });
      return;
    }
    
    res.status(200).json({ status: 'ok', mensaje: 'Alumno dado de baja (baja lógica) con éxito', data: null });
  } catch (error: any) {
    console.error('Error al dar de baja el alumno:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno del servidor', data: null });
  }
};
