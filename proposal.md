# Propuesta TP DSW

## Grupo
### Integrantes
* 54286 - Cuffia, Felipe
* 54288 - Garibaldi, Francisco
* 53944 - Radicic, Patricio
* 53914 - Tosar, Salvador
* 55263 - Yocco, Simon

### Repositorios
* [fullstack app](https://github.com/felipe684k/TPDSW/tree/main/fullstack)

## Tema
### Sistema de Gestión - Instituto de Inglés.
El sistema a desarrollar es una plataforma de gestión para un instituto dedicado exclusivamente al dictado de cursos de idioma inglés. Su objetivo principal es digitalizar y centralizar los procesos administrativos básicos que actualmente se realizan de forma manual. Esto permitirá optimizar la gestión de la oferta académica, la organización de comisiones y la inscripción de alumnos. El sistema cuenta con acceso diferenciado para el personal administrativo del instituto (Administrador/Secretaría) y un portal de autogestión para los Alumnos (consulta de cursadas y estado de cuenta), restringiendo el inicio de sesión para el rol de Profesores.

### Modelo
![E01-R03_ ART-MD-Modelo de Dominio2](https://github.com/user-attachments/assets/041ac472-1303-449d-965a-80f2a0fe476b)

## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Aula<br>2. CRUD Ciclo Lectivo<br>3. CRUD Docente<br>4. CRUD Alumno|
|CRUD dependiente|1. CRUD Comisión {depende de} CRUD Curso, CRUD Aula, CRUD Docente, CRUD Ciclo Lectivo y Horario<br>2. CRUD Curso {depende de} Nivel y Arancel (TuitionFee)<br>3. CRUD Inscripción {depende de} CRUD Alumno y CRUD Comisión|
|Listado<br>+<br>detalle| 1. Listado de cursos filtrado por nivel muestra nombre del curso, carga horaria y costo => detalle del curso<br> 2. Listado de comisiones filtrado por nivel o curso muestra aula, horario, docente y cupo disponible => detalle de la comisión<br> 3. Listado de alumnos filtrado por comisión muestra nombre, DNI y fecha de inscripción => detalle del alumno|
|CUU/Epic|1. CUU 1: Crear y editar comisiones (validando disponibilidad de aula y docente por horario)<br>2. CUU 2: Inscribir alumno a comisión (validando correlatividad de nivel y cupo)<br>3. CUU 3: Evaluar cursada y promover automáticamente de nivel al alumno<br>4. CUU 4: Registrar pagos de cuotas y reporte de alumnos con deuda|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Aula<br>2. CRUD Ciclo Lectivo<br>3. CRUD Docente<br>4. CRUD Alumno<br>5. CRUD Curso<br>6. CRUD Comisión<br>7. CRUD Inscripción|
|CUU/Epic|1. CUU 1: Crear y editar comisiones<br>2. CUU 2: Inscribir alumno a comisión<br>3. CUU 3: Asignar docente y aula a una comisión sin solapamiento horario<br>4. CUU 4: Evaluar cursada y promover automáticamente de nivel al alumno<br>5. CUU 5: Registrar pagos de cuotas y generar reporte de alumnos deudores|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Otros|1. Envío de mail al alumno confirmando su inscripción mediante API externa|
