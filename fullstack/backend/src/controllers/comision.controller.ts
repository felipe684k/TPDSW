import type { Request, Response } from 'express';
import { Comision, Horario, ComisionHorario, UsuarioComision, Curso, Aula, CicloLectivo, Usuario } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

export const getComisiones = async (req: Request, res: Response) => {
  try {
    const { id_ciclo_lectivo } = req.query;
    
    const filter: any = {};
    if (id_ciclo_lectivo) {
      filter.id_ciclo_lectivo = id_ciclo_lectivo;
    }

    const comisiones = await Comision.findAll({
      where: filter,
      include: [
        { model: Curso, as: 'curso' },
        { model: Aula, as: 'aula' },
        { model: CicloLectivo, as: 'ciclo_lectivo' },
        { model: Horario, as: 'horarios' },
        { model: Usuario, as: 'profesores', attributes: ['id', 'nombre', 'apellido', 'email'] }
      ]
    });
    res.json({ success: true, data: comisiones });
  } catch (error) {
    console.error('Error fetching comisiones:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener comisiones' });
  }
};

export const getComisionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const comision = await Comision.findByPk(id, {
      include: [
        { model: Curso, as: 'curso' },
        { model: Aula, as: 'aula' },
        { model: CicloLectivo, as: 'ciclo_lectivo' },
        { model: Horario, as: 'horarios' },
        { model: Usuario, as: 'profesores', attributes: ['id', 'nombre', 'apellido', 'email'] }
      ]
    });
    if (!comision) {
      res.status(404).json({ success: false, mensaje: 'Comisión no encontrada' });
      return;
    }
    res.json({ success: true, data: comision });
  } catch (error) {
    console.error('Error fetching comision:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener la comisión' });
  }
};

export const createComision = async (req: Request, res: Response): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id_curso, id_aula, id_ciclo_lectivo, horarios, id_profesor } = req.body;

    // Validar que la hora de inicio sea menor a la de fin
    if (horarios && horarios.length > 0) {
      for (const reqHorario of horarios) {
        if (reqHorario.hora_inicio >= reqHorario.hora_fin) {
          await t.rollback();
          res.status(400).json({ success: false, mensaje: `Horario inválido en ${reqHorario.dia}: La hora de fin debe ser posterior a la de inicio.` });
          return;
        }
      }
    }

    // Verificar si hay solapamiento de aulas
    if (horarios && horarios.length > 0) {
      const overlaps: string[] = [];
      
      for (const reqHorario of horarios) {
        // Encontrar comisiones en el mismo aula y ciclo lectivo
        const overlapping = await Comision.findAll({
          where: { id_aula, id_ciclo_lectivo },
          include: [{
            model: Horario,
            as: 'horarios',
            where: {
              dia: reqHorario.dia,
              [Op.or]: [
                {
                  // The existing schedule starts before new ends AND ends after new starts
                  hora_inicio: { [Op.lt]: reqHorario.hora_fin },
                  hora_fin: { [Op.gt]: reqHorario.hora_inicio }
                }
              ]
            }
          }],
          transaction: t
        });

        if (overlapping.length > 0) {
          for (const overlapComision of overlapping) {
            const block = (overlapComision as any).horarios[0];
            overlaps.push(`El ${reqHorario.dia} de ${block.hora_inicio.slice(0,5)} a ${block.hora_fin.slice(0,5)} (ocupado por "${(overlapComision as any).nombre}")`);
          }
        }
      }

      if (overlaps.length > 0) {
        await t.rollback();
        res.status(409).json({ 
          success: false, 
          mensaje: `El aula ya está ocupada en los siguientes horarios:\n- ${overlaps.join('\n- ')}` 
        });
        return;
      }
    }

    // Generar el nombre de la comisión automáticamente
    const comisionesPrevias = await Comision.count({ where: { id_curso, id_ciclo_lectivo }, transaction: t });
    const cursoData: any = await Curso.findByPk(id_curso, { transaction: t });
    const nombreGenerado = `Comisión ${comisionesPrevias + 1} - ${cursoData?.nombre_curso || ''}`;

    // Crear la comisión
    const nuevaComision: any = await Comision.create({ nombre: nombreGenerado, id_curso, id_aula, id_ciclo_lectivo }, { transaction: t });

    // Vincular Horarios
    if (horarios && horarios.length > 0) {
      for (const h of horarios) {
        // Buscar si ya existe el bloque horario, si no crearlo
        const [horarioObj] = await Horario.findOrCreate({
          where: { dia: h.dia, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin },
          transaction: t
        });
        await ComisionHorario.create({
          id_comision: nuevaComision.id_comision,
          id_horario: (horarioObj as any).id_horario
        }, { transaction: t });
      }
    }

    // Vincular Profesor
    if (id_profesor) {
      await UsuarioComision.create({
        id_usuario: id_profesor,
        id_comision: nuevaComision.id_comision
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, data: nuevaComision });
  } catch (error) {
    await t.rollback();
    console.error('Error creating comision:', error);
    res.status(500).json({ success: false, mensaje: 'Error al crear la comisión' });
  }
};

export const updateComision = async (req: Request, res: Response): Promise<void> => {
  // Simplificado por ahora (idealmente borrar y recrear links, y checkear solapamientos ignorando self)
  res.status(501).json({ success: false, mensaje: 'No implementado. Por favor, elimine y cree una nueva comisión.' });
};

export const deleteComision = async (req: Request, res: Response): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const comision = await Comision.findByPk(id);
    if (!comision) {
      await t.rollback();
      res.status(404).json({ success: false, mensaje: 'Comisión no encontrada' });
      return;
    }
    
    // Al estar con cascade o hacerlo manual:
    await ComisionHorario.destroy({ where: { id_comision: id }, transaction: t });
    await UsuarioComision.destroy({ where: { id_comision: id }, transaction: t });
    await comision.destroy({ transaction: t });
    
    await t.commit();
    res.json({ success: true, mensaje: 'Comisión eliminada correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting comision:', error);
    res.status(500).json({ success: false, mensaje: 'Error al eliminar la comisión' });
  }
};
