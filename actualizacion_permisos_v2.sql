-- ============================================================
-- SCRIPT INCREMENTAL v2 — Rediseño del módulo Permisos
-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre la BD `proyecto_pw`
-- (después de actualizacion_frames_rbac.sql).
-- ============================================================

-- Motivo: todos los roles deben poder VER la lista de usuarios (solo lectura;
-- las acciones crear/editar/desactivar quedan reservadas al Administrador).
INSERT IGNORE INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(2, 'usuarios', 'leer'),
(3, 'usuarios', 'leer'),
(4, 'usuarios', 'leer'),
(5, 'usuarios', 'leer'),
(6, 'usuarios', 'leer'),
(7, 'usuarios', 'leer'),
(8, 'usuarios', 'leer');
