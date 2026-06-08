# Propuesta TP DSW

## Grupo
### Integrantes
* 54286 - Cuffia, Felipe
* 54288 - Garibaldi, Francisco
* 53944 - Radicic, Patricio
* 53914 - Tosar, Salvador
* 55263 - Yocco, Simon

### Repositorios
* [frontend app](http://hyperlinkToGihubOrGitlab)
* [backend app](http://hyperlinkToGihubOrGitlab)
*Nota*: si utiliza un monorepo indicar un solo link con fullstack app.

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
|CRUD simple|1. CRUD Nivel<br>2. [cite_start]CRUD Aula [cite: 20]<br>3. [cite_start]CRUD Horario [cite: 20]<br>4. [cite_start]CRUD Docente [cite: 20]<br>5. [cite_start]CRUD Alumno [cite: 20]|
|CRUD dependiente|1. [cite_start]CRUD Comisión {depende de} CRUD Curso, CRUD Aula, CRUD Docente y CRUD Horario [cite: 20]<br>2. [cite_start]CRUD Curso {depende de} CRUD Nivel [cite: 20]<br>3. [cite_start]CRUD Inscripción {depende de} CRUD Alumno y CRUD Comisión [cite: 20]|
|Listado<br>+<br>detalle| 1. [cite_start]Listado de cursos filtrado por nivel muestra nombre del curso, carga horaria y costo => detalle del curso [cite: 20][cite_start]<br> 2. Listado de comisiones filtrado por nivel o curso muestra aula, horario, docente y cupo disponible => detalle de la comisión [cite: 20][cite_start]<br> 3. Listado de alumnos filtrado por comisión muestra nombre, DNI y fecha de inscripción => detalle del alumno [cite: 20]|
|CUU/Epic|1. [cite_start]CUU 1: Crear comisiones [cite: 20]<br>2. [cite_start]CUU 2: Inscribir alumno a comisión [cite: 20]<br>3. [cite_start]CUU 3: Asignar docente a una comisión [cite: 20]|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. [cite_start]CRUD Nivel [cite: 20]<br>2. [cite_start]CRUD Aula [cite: 20]<br>3. [cite_start]CRUD Horario [cite: 20]<br>4. [cite_start]CRUD Docente [cite: 20]<br>5. [cite_start]CRUD Alumno [cite: 20]<br>6. [cite_start]CRUD Comisión [cite: 20]<br>7. [cite_start]CRUD Curso [cite: 20]<br>8. [cite_start]CRUD Inscripción [cite: 20]|
|CUU/Epic|1. [cite_start]CUU 1: Crear comisiones [cite: 20]<br>2. [cite_start]CUU 2: Inscribir alumno a comisión [cite: 20]<br>3. [cite_start]CUU 3: Asignar docente a una comisión [cite: 20]<br>4. [cite_start]CUU 4: Generar reporte de alumnos [cite: 21]<br>5. [cite_start]CUU 5: Asignar aulas a comisiones [cite: 21]|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Otros|1. [cite_start]Envío de mail al alumno confirmando su inscripción mediante API externa [cite: 21]|

