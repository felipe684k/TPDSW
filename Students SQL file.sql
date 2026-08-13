-- Script para insertar 20 alumnos de prueba en la tabla usuario
-- Podés copiar todo esto y pegarlo en MySQL Workbench o DBeaver y darle al botón del rayito (Ejecutar)

INSERT INTO usuario (dni, nombre, apellido, telefono, fecha_nacimiento, email, usuario, contrasena, tipo, activo) VALUES
('40123456', 'Lucía', 'González', '2214567890', '1998-05-12', 'lucia.g@email.com', '40123456', '40123456', 'ALUMNO', true),
('41234567', 'Tomás', 'Ramírez', '2215678901', '1999-08-23', 'tomas.r@email.com', '41234567', '41234567', 'ALUMNO', true),
('42345678', 'Valentina', 'Fernández', '2216789012', '2000-02-15', 'valen.f@email.com', '42345678', '42345678', 'ALUMNO', true),
('43456789', 'Mateo', 'López', '2217890123', '2001-11-30', 'mateo.l@email.com', '43456789', '43456789', 'ALUMNO', true),
('44567890', 'Antonella', 'Pérez', '2218901234', '2002-04-18', 'anto.p@email.com', '44567890', '44567890', 'ALUMNO', true),
('45678901', 'Joaquín', 'Martínez', '2219012345', '2003-09-05', 'joaquin.m@email.com', '45678901', '45678901', 'ALUMNO', true),
('46789012', 'Sofía', 'Gómez', '2210123456', '2004-01-20', 'sofia.g@email.com', '46789012', '46789012', 'ALUMNO', true),
('39111222', 'Agustín', 'Rodríguez', '2211234567', '1997-07-14', 'agus.r@email.com', '39111222', '39111222', 'ALUMNO', true),
('38222333', 'Camila', 'Sánchez', '2212345678', '1996-10-09', 'cami.s@email.com', '38222333', '38222333', 'ALUMNO', true),
('40333444', 'Facundo', 'Romero', '2213456789', '1998-12-01', 'facu.r@email.com', '40333444', '40333444', 'ALUMNO', true),
('41444555', 'Julieta', 'Díaz', '2214567891', '1999-03-25', 'juli.d@email.com', '41444555', '41444555', 'ALUMNO', true),
('42555666', 'Nicolás', 'Torres', '2215678902', '2000-06-19', 'nico.t@email.com', '42555666', '42555666', 'ALUMNO', true),
('43666777', 'Micaela', 'Flores', '2216789013', '2001-08-08', 'mica.f@email.com', '43666777', '43666777', 'ALUMNO', true),
('44777888', 'Santiago', 'Benítez', '2217890124', '2002-11-02', 'santi.b@email.com', '44777888', '44777888', 'ALUMNO', true),
('45888999', 'Martina', 'Ruiz', '2218901235', '2003-05-27', 'martu.r@email.com', '45888999', '45888999', 'ALUMNO', true),
('46999000', 'Ignacio', 'Álvarez', '2219012346', '2004-02-14', 'nacho.a@email.com', '46999000', '46999000', 'ALUMNO', true),
('39000111', 'Carolina', 'Herrera', '2210123457', '1997-09-30', 'caro.h@email.com', '39000111', '39000111', 'ALUMNO', true),
('40111222', 'Bautista', 'Domínguez', '2211234568', '1998-04-05', 'bauti.d@email.com', '40111222', '40111222', 'ALUMNO', true),
('41222333', 'Florencia', 'Castro', '2212345679', '1999-12-22', 'flor.c@email.com', '41222333', '41222333', 'ALUMNO', true),
('42333444', 'Lucas', 'Silva', '2213456780', '2000-10-11', 'lucas.s@email.com', '42333444', '42333444', 'ALUMNO', true);