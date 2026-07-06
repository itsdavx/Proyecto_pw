-- ============================================================
-- SCRIPT INCREMENTAL v4 — Eliminación del módulo "Opciones"
-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre la BD `proyecto_pw`.
-- Su funcionalidad fue absorbida por el módulo Permisos
-- (acciones internas por Frame en servidor/permisos/registro.php).
-- ============================================================

-- Motivo: quitar los permisos del módulo eliminado.
DELETE FROM `permisos_rol` WHERE `modulo` = 'opciones';

-- Motivo: quitar el ItemMenu "Opciones" (cascada limpia menu_orden_usuario).
DELETE FROM `menu` WHERE `modulo` = 'opciones';

-- Motivo: la tabla de sub-opciones era exclusiva del módulo eliminado;
-- ningún otro módulo la consume.
DROP TABLE IF EXISTS `menu_opciones`;
