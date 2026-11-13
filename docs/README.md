# Documentación del Proyecto — TP DSW (Instituto de Inglés)

## Índice
1. [Propuesta del Trabajo Práctico](../proposal.md)
2. [Instrucciones de Instalación y Ejecución](#instrucciones-de-instalación-y-ejecución)
3. [Credenciales de Prueba](#credenciales-de-prueba)

---

## Instrucciones de Instalación y Ejecución

### Requisitos Previos
- **Node.js** v18 o superior
- **MySQL** v8.0 o superior corriendo en local (`localhost:3306`)

### 1. Configuración de la Base de Datos
Crear una base de datos vacía en MySQL llamada `instituto_ingles`:
```sql
CREATE DATABASE IF NOT EXISTS instituto_ingles;
```

### 2. Configuración e Inicio del Backend
```bash
cd fullstack/backend
npm install
```
Verificar el archivo `fullstack/backend/.env`:
```env
DB_NAME=instituto_ingles
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306
```
Iniciar el servidor de desarrollo (sincroniza las tablas y crea los niveles y usuarios iniciales automáticamente):
```bash
npm run dev
```
El backend quedará corriendo en `http://localhost:3000`.

### 3. Configuración e Inicio del Frontend
En otra terminal:
```bash
cd fullstack/frontend
npm install
npm run dev
```
El frontend quedará disponible en `http://localhost:5173`.

---

## Credenciales de Prueba

| Rol | Usuario | Contraseña | Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador / Secretaría** | `admin` | `12345` | Gestión completa (Ciclos, Aulas, Cursos, Comisiones, Profesores, Alumnos, Inscripciones, Pagos y Reporte de Deudores) |
| **Alumno** | `user` (o nombre en minúscula) | `12345` (o DNI del alumno) | Portal del Alumno (Cursadas e Historial de Cuotas/Pagos) |
| **Profesor** | DNI o nombre del profesor | DNI | Acceso restringido (muestra aviso de bloqueo para rol Profesor) |
