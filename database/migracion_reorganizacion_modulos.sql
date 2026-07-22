-- =====================================================================
-- Migración — Reorganización de módulos de facturación:
--   * Frame 4 pasa a ser el módulo Clientes (icono propio).
--   * La agrupación personal "Frames" pasa a llamarse
--     "Módulo Facturación".
--   * RBAC: la gestión de productos pertenece ahora a Inventario
--     (frame3) y la de clientes al módulo Clientes (frame4);
--     Facturación (frame2) conserva solo generar factura y editar
--     el emisor. Se retiran de frame2 las acciones trasladadas.
-- No modifica datos de negocio. Ejecutar una sola vez sobre la BD
-- ya desplegada (instalación nueva: usar database/proyecto_pw.sql).
-- =====================================================================

SET AUTOCOMMIT = 0;
START TRANSACTION;

-- Frame 4 → Clientes
UPDATE `menu` SET `nombre` = 'Clientes', `icono` = 'fa-address-book' WHERE `modulo` = 'frame4';

-- Agrupación personal "Frames" → "Módulo Facturación" (todos los usuarios)
UPDATE `menu_super_usuario` SET `nombre` = 'Módulo Facturación' WHERE `nombre` = 'Frames';

-- RBAC: las acciones estado/eliminar ya no existen bajo frame2
-- (se administran desde Inventario y Clientes).
DELETE FROM `permisos_rol` WHERE `modulo` = 'frame2' AND `accion` IN ('estado', 'eliminar');

-- Acciones de los módulos Inventario (frame3) y Clientes (frame4).
-- El Administrador las recibe explícitamente por consistencia con el
-- resto del catálogo (el sistema ya lo exime de la verificación).
INSERT INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(1, 'frame3', 'crear'),
(1, 'frame3', 'editar'),
(1, 'frame3', 'estado'),
(1, 'frame3', 'eliminar'),
(1, 'frame4', 'crear'),
(1, 'frame4', 'editar'),
(1, 'frame4', 'estado'),
(1, 'frame4', 'eliminar');

COMMIT;
