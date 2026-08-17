import { type Request, type Response } from 'express';
import { Curso, Nivel, ValorCuota } from '../models/index.js';

export const getAllCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const cursos = await Curso.findAll({
      where: { activo: true },
      include: [
        { model: Nivel, as: 'nivel' },
        { model: ValorCuota, as: 'valores_cuota' }
      ]
    });
    res.status(200).json({ status: 'ok', data: cursos });
  } catch (error: any) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno', data: [] });
  }
};

export const createCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_curso, codigo_nivel, horas_semanales, dias_por_semana, matricula, valor_cuota_inicial } = req.body;
    
    // Validaciones básicas
    if (!nombre_curso || !codigo_nivel || !valor_cuota_inicial) {
      res.status(400).json({ status: 'error', mensaje: 'Faltan campos obligatorios' });
      return;
    }

    const nuevoCurso: any = await Curso.create({
      nombre_curso,
      codigo_nivel,
      horas_semanales,
      dias_por_semana,
      matricula,
      activo: true
    });

    // Crear valor de cuota asociado
    await ValorCuota.create({
      id_curso: nuevoCurso.id_curso,
      fecha_desde: new Date(),
      costo_mensual: valor_cuota_inicial
    });

    res.status(201).json({ status: 'ok', mensaje: 'Curso creado con éxito', data: nuevoCurso });
  } catch (error: any) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno' });
  }
};

export const updateCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_curso, codigo_nivel, horas_semanales, dias_por_semana, matricula } = req.body;
    
    const cursoExistente = await Curso.findOne({ where: { id_curso: id } });
    if (!cursoExistente) {
      res.status(404).json({ status: 'error', mensaje: 'Curso no encontrado' });
      return;
    }

    await Curso.update({
      nombre_curso,
      codigo_nivel,
      horas_semanales,
      dias_por_semana,
      matricula
    }, { where: { id_curso: id } });

    res.status(200).json({ status: 'ok', mensaje: 'Curso actualizado con éxito' });
  } catch (error: any) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno' });
  }
};

export const deleteCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const cursoExistente = await Curso.findOne({ where: { id_curso: id } });
    if (!cursoExistente) {
      res.status(404).json({ status: 'error', mensaje: 'Curso no encontrado' });
      return;
    }

    // Borrado lógico
    await Curso.update({ activo: false }, { where: { id_curso: id } });
    
    res.status(200).json({ status: 'ok', mensaje: 'Curso desactivado con éxito' });
  } catch (error: any) {
    console.error('Error al desactivar curso:', error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno' });
  }
};
