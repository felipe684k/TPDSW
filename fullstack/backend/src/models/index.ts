import { sequelize } from '../config/database.js';

import user from './user.js';
import Nivel from './nivel.js';
import Curso from './curso.js';
import ValorCuota from './valor_cuota.js';
import UsuarioNivel from './usuario_nivel.js';
import Aula from './aula.js';
import CicloLectivo from './ciclo_lectivo.js';
import Comision from './comision.js';
import UsuarioComision from './usuario_comision.js';
import Horario from './horario.js';
import ComisionHorario from './comision_horario.js';
import Inscripcion from './inscripcion.js';
import Pago from './pago.js';

// Relaciones
// Nivel recursivo
Nivel.belongsTo(Nivel, { as: 'Siguiente', foreignKey: 'codigo_nivel_siguiente' });
Nivel.hasMany(Nivel, { as: 'Anteriores', foreignKey: 'codigo_nivel_siguiente' });

// Curso -> Nivel
Curso.belongsTo(Nivel, { foreignKey: 'codigo_nivel', as: 'nivel' });
Nivel.hasMany(Curso, { foreignKey: 'codigo_nivel', as: 'cursos' });

// ValorCuota -> Curso
ValorCuota.belongsTo(Curso, { foreignKey: 'id_curso', as: 'curso' });
Curso.hasMany(ValorCuota, { foreignKey: 'id_curso', as: 'valores_cuota' });

// UsuarioNivel (M:N entre Usuario y Nivel)
user.belongsToMany(Nivel, { through: UsuarioNivel, foreignKey: 'id_usuario', otherKey: 'codigo_nivel', as: 'niveles' });
Nivel.belongsToMany(user, { through: UsuarioNivel, foreignKey: 'codigo_nivel', otherKey: 'id_usuario', as: 'usuarios' });

// Comision -> Curso, Aula, CicloLectivo
Comision.belongsTo(Curso, { foreignKey: 'id_curso', as: 'curso' });
Curso.hasMany(Comision, { foreignKey: 'id_curso', as: 'comisiones' });

Comision.belongsTo(Aula, { foreignKey: 'id_aula', as: 'aula' });
Aula.hasMany(Comision, { foreignKey: 'id_aula', as: 'comisiones' });

Comision.belongsTo(CicloLectivo, { foreignKey: 'id_ciclo_lectivo', as: 'ciclo_lectivo' });
CicloLectivo.hasMany(Comision, { foreignKey: 'id_ciclo_lectivo', as: 'comisiones' });

// UsuarioComision (M:N entre Usuario y Comision)
user.belongsToMany(Comision, { through: UsuarioComision, foreignKey: 'id_usuario', otherKey: 'id_comision', as: 'comisiones' });
Comision.belongsToMany(user, { through: UsuarioComision, foreignKey: 'id_comision', otherKey: 'id_usuario', as: 'profesores' });

// ComisionHorario (M:N entre Comision y Horario)
Comision.belongsToMany(Horario, { through: ComisionHorario, foreignKey: 'id_comision', otherKey: 'id_horario', as: 'horarios' });
Horario.belongsToMany(Comision, { through: ComisionHorario, foreignKey: 'id_horario', otherKey: 'id_comision', as: 'comisiones' });

// Inscripcion -> Usuario, Comision
Inscripcion.belongsTo(user, { foreignKey: 'id_usuario', as: 'usuario' });
user.hasMany(Inscripcion, { foreignKey: 'id_usuario', as: 'inscripciones' });

Inscripcion.belongsTo(Comision, { foreignKey: 'id_comision', as: 'comision' });
Comision.hasMany(Inscripcion, { foreignKey: 'id_comision', as: 'inscripciones' });

// Pago -> Inscripcion
Pago.belongsTo(Inscripcion, { foreignKey: 'id_inscripcion', as: 'inscripcion' });
Inscripcion.hasMany(Pago, { foreignKey: 'id_inscripcion', as: 'pagos' });

export {
  sequelize,
  user as Usuario,
  Nivel,
  Curso,
  ValorCuota,
  UsuarioNivel,
  Aula,
  CicloLectivo,
  Comision,
  UsuarioComision,
  Horario,
  ComisionHorario,
  Inscripcion,
  Pago
};
