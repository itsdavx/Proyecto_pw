-- ============================================================
-- MIGRACIÓN v6 — Limpieza estructural tras la revisión de la BD
-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre la BD `proyecto_pw`.
-- Conserva todos los datos operativos; solo elimina estructura
-- y filas obsoletas del modelo de menú global anterior.
-- ============================================================

-- 1) Eliminar las filas agrupadoras globales obsoletas (id 2 "Administracion"
--    e id 8 "Mi Perfil"). Los agrupadores ahora son SuperMenus por usuario
--    (menu_super_usuario); estas filas sin URL ya no se muestran ni se usan.
--    El FK fk_menu_padre (ON DELETE SET NULL) desvincula a sus antiguos hijos.
DELETE FROM `menu` WHERE `url` IS NULL;

-- 2) Eliminar la jerarquía global obsoleta: la columna padre_id ya no la
--    lee ninguna parte del sistema (la jerarquía vive en menu_super_usuario
--    + menu_orden_usuario.id_super).
ALTER TABLE `menu` DROP FOREIGN KEY `fk_menu_padre`;
ALTER TABLE `menu` DROP INDEX `fk_menu_padre`;
ALTER TABLE `menu` DROP COLUMN `padre_id`;

-- 3) Reforzar los invariantes del modelo actual: todo ItemMenu abre un
--    Frame (url) y pertenece a un módulo RBAC (modulo). Todas las filas
--    restantes ya cumplen ambas condiciones.
ALTER TABLE `menu`
  MODIFY `url` varchar(255) NOT NULL COMMENT 'pagina del Frame que abre el ItemMenu',
  MODIFY `modulo` varchar(50) NOT NULL COMMENT 'modulo RBAC (permisos_rol / registro de frames)';

-- 4) Actualizar comentarios desactualizados (mencionaban el módulo
--    "opciones" eliminado y no reflejaban los frames).
ALTER TABLE `permisos_rol`
  MODIFY `modulo` varchar(50) NOT NULL COMMENT 'modulo del registro de frames (servidor/permisos/registro.php)',
  MODIFY `accion` varchar(50) NOT NULL COMMENT 'leer|crear|editar|eliminar';
