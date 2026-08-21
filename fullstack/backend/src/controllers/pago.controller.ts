import { type Request, type Response } from 'express';
import { Pago, Inscripcion, Usuario, Comision, Curso, ValorCuota } from '../models/index.js';

/**
 * Obtener todos los pagos registrados
 */
export const getAllPagos = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagos = await Pago.findAll({
      include: [
        {
          model: Inscripcion,
          as: 'inscripcion',
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido', 'dni', 'email']
            },
            {
              model: Comision,
              as: 'comision',
              attributes: ['id_comision', 'nombre']
            }
          ]
        }
      ],
      order: [['id_pago', 'DESC']]
    });

    res.status(200).json({ status: 'ok', data: pagos });
  } catch (error: any) {
    console.error('Error al obtener pagos:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error al consultar pagos', data: [] });
  }
};

/**
 * Obtener el estado de cuenta (cuotas pagadas y pendientes) de un alumno por su ID de usuario
 */
export const getEstadoCuentaAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_usuario } = req.params;

    // Buscar inscripciones del alumno
    const inscripciones: any = await Inscripcion.findAll({
      where: { id_usuario: id_usuario },
      include: [
        {
          model: Comision,
          as: 'comision',
          include: [
            {
              model: Curso,
              as: 'curso',
              include: [
                {
                  model: ValorCuota,
                  as: 'valores_cuota'
                }
              ]
            }
          ]
        },
        {
          model: Pago,
          as: 'pagos'
        }
      ]
    });

    if (!inscripciones || inscripciones.length === 0) {
      res.status(200).json({ status: 'ok', mensaje: 'El alumno no posee inscripciones activas', data: { inscripciones: [], cuotas: [] } });
      return;
    }

    const meses = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero'];
    const resultadoCuotas: any[] = [];

    for (const insc of inscripciones) {
      const curso = insc.comision?.curso;
      // Obtener el monto base de la cuota desde ValorCuota o Curso
      let montoBase = 12000;
      if (curso) {
        if (curso.valores_cuota && curso.valores_cuota.length > 0) {
          montoBase = Number(curso.valores_cuota[0].costo_mensual) || 12000;
        } else if (curso.matricula) {
          montoBase = Number(curso.matricula) || 12000;
        }
      }

      const pagosRegistrados: any[] = insc.pagos || [];

      meses.forEach((mes, idx) => {
        const pagoExistente = pagosRegistrados.find(p => p.mes_cuota?.toLowerCase() === mes.toLowerCase());
        const realIdx = idx + 3;
        const monthNum = realIdx > 12 ? realIdx - 12 : realIdx;
        const yearNum = realIdx > 12 ? 2027 : 2026;
        const vencimiento = `10/${monthNum.toString().padStart(2, '0')}/${yearNum}`;

        if (pagoExistente) {
          resultadoCuotas.push({
            id: pagoExistente.id_pago,
            id_inscripcion: insc.id_inscripcion,
            comision: insc.comision?.nombre || 'Comisión',
            mes_cuota: mes,
            monto: Number(pagoExistente.monto),
            vencimiento,
            estado: pagoExistente.estado || 'Pagado',
            fecha_pago: pagoExistente.fecha_pago,
            recargo: Number(pagoExistente.recargo || 0),
            descuento: Number(pagoExistente.descuento || 0)
          });
        } else {
          resultadoCuotas.push({
            id: `pending_${insc.id_inscripcion}_${idx}`,
            id_inscripcion: insc.id_inscripcion,
            comision: insc.comision?.nombre || 'Comisión',
            mes_cuota: mes,
            monto: montoBase,
            vencimiento,
            estado: 'Pendiente',
            fecha_pago: null,
            recargo: 0,
            descuento: 0
          });
        }
      });
    }

    res.status(200).json({ status: 'ok', data: { inscripciones, cuotas: resultadoCuotas } });
  } catch (error: any) {
    console.error('Error al obtener estado de cuenta:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error al consultar estado de cuenta', data: null });
  }
};

/**
 * Registrar un nuevo pago de cuota o matrícula
 */
export const registrarPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_inscripcion, mes_cuota, monto, recargo, descuento, estado, fecha_pago } = req.body;

    if (!id_inscripcion || !mes_cuota || monto === undefined) {
      res.status(400).json({ status: 'error', mensaje: 'Faltan campos obligatorios (id_inscripcion, mes_cuota, monto)', data: null });
      return;
    }

    const fechaReal = fecha_pago || new Date().toISOString().split('T')[0];
    const estadoReal = estado || 'Pagado';

    // Verificar si ya existe un registro de pago para esta inscripción y mes
    const pagoExistente: any = await Pago.findOne({
      where: {
        id_inscripcion,
        mes_cuota
      }
    });

    if (pagoExistente) {
      // Actualizar registro existente
      await pagoExistente.update({
        fecha_pago: fechaReal,
        monto: Number(monto),
        recargo: Number(recargo || 0),
        descuento: Number(descuento || 0),
        estado: estadoReal
      });

      res.status(200).json({ status: 'ok', mensaje: 'Pago actualizado con éxito', data: pagoExistente });
      return;
    }

    // Crear nuevo pago
    const nuevoPago = await Pago.create({
      id_inscripcion,
      fecha_pago: fechaReal,
      monto: Number(monto),
      recargo: Number(recargo || 0),
      descuento: Number(descuento || 0),
      estado: estadoReal,
      mes_cuota
    });

    res.status(201).json({ status: 'ok', mensaje: 'Pago registrado con éxito', data: nuevoPago });
  } catch (error: any) {
    console.error('Error al registrar pago:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error interno al registrar pago', data: null });
  }
};

/**
 * Obtener listado de morosos (alumnos con cuotas pendientes vencidas)
 */
export const getMorosos = async (req: Request, res: Response): Promise<void> => {
  try {
    const inscripciones: any = await Inscripcion.findAll({
      where: { estado: 'Activa' },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          where: { tipo: 'ALUMNO', activo: true }
        },
        {
          model: Comision,
          as: 'comision'
        },
        {
          model: Pago,
          as: 'pagos'
        }
      ]
    });

    const morososMap = new Map();

    for (const insc of inscripciones) {
      const userObj = insc.usuario;
      if (!userObj) continue;

      const pagos: any[] = insc.pagos || [];
      const mesesTranscurridos = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto'];
      
      const cuotasImpagas: string[] = [];
      let deudaTotal = 0;

      for (const mes of mesesTranscurridos) {
        const pagado = pagos.some(p => p.mes_cuota?.toLowerCase() === mes.toLowerCase() && p.estado === 'Pagado');
        if (!pagado) {
          cuotasImpagas.push(mes);
          deudaTotal += 12000;
        }
      }

      if (cuotasImpagas.length > 0) {
        morososMap.set(userObj.id, {
          id: userObj.id,
          nombreCompleto: `${userObj.apellido}, ${userObj.nombre}`,
          dni: userObj.dni,
          curso: insc.comision?.nombre || 'Curso General',
          cuotasImpagas: cuotasImpagas.length,
          deudaTotal
        });
      }
    }

    res.status(200).json({ status: 'ok', data: Array.from(morososMap.values()) });
  } catch (error: any) {
    console.error('Error al obtener morosos:', error?.message || error);
    res.status(500).json({ status: 'db_error', mensaje: 'Error al consultar morosos', data: [] });
  }
};
