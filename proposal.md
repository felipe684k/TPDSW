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
El sistema a desarrollar es una plataforma de gestión para un instituto dedicado exclusivamente al dictado de cursos de idioma inglés. Su objetivo principal es digitalizar y centralizar los procesos administrativos básicos que actualmente se realizan de forma manual. Esto permitirá optimizar la gestión de la oferta académica, la organización de comisiones y la inscripción de alumnos. El sistema será de uso exclusivamente interno, permitiendo el acceso únicamente al personal del instituto (Administrador/Secretaría y Profesores).

### Modelo
![imagen del modelo]()

*Nota*: incluir un link con la imagen de un modelo, puede ser modelo de dominio, diagrama de clases, DER. Si lo prefieren pueden utilizar diagramas con [Mermaid](https://mermaid.js.org) en lugar de imágenes.

## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Nivel<br>2. CRUD Aula<br>3. CRUD Horario<br>4. CRUD Docente<br>5. CRUD Alumno|
|CRUD dependiente|1. CRUD Comisión {depende de} CRUD Curso, CRUD Aula, CRUD Docente y CRUD Horario<br>2. CRUD Curso {depende de} CRUD Nivel<br>3. CRUD Inscripción {depende de} CRUD Alumno y CRUD Comisión|
|Listado<br>+<br>detalle| 1. Listado de cursos filtrado por nivel muestra nombre del curso, carga horaria y costo => detalle del curso<br> 2. Listado de comisiones filtrado por nivel o curso muestra aula, horario, docente y cupo disponible => detalle de la comisión<br> 3. Listado de alumnos filtrado por comisión muestra nombre, DNI y fecha de inscripción => detalle del alumno|
|CUU/Epic|1. CUU 1: Crear comisiones<br>2. CUU 2: Inscribir alumno a comisión<br>3. CUU 3: Asignar docente a una comisión|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Nivel<br>2. CRUD Aula<br>3. CRUD Horario<br>4. CRUD Docente<br>5. CRUD Alumno<br>6. CRUD Comisión<br>7. CRUD Curso<br>8. CRUD Inscripción|
|CUU/Epic|1. CUU 1: Crear comisiones<br>2. CUU 2: Inscribir alumno a comisión<br>3. CUU 3: Asignar docente a una comisión<br>4. CUU 4: Generar reporte de alumnos<br>5. CUU 5: Asignar aulas a comisiones|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Otros|1. Envío de mail al alumno confirmando su inscripción mediante API externa|
