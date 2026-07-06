-- ============================================================
-- SCRIPT INCREMENTAL v3 — Rediseño del módulo Menú
-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre la BD `proyecto_pw`
-- (después de actualizacion_frames_rbac.sql y actualizacion_permisos_v2.sql).
-- ============================================================

-- Motivo: los SuperMenus (contenedores) pasan a ser personales de cada usuario.
CREATE TABLE IF NOT EXISTS `menu_super_usuario` (
  `id_super` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `orden` smallint(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_super`),
  KEY `fk_msu_user` (`id_user`),
  CONSTRAINT `fk_msu_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Motivo: cada usuario ubica sus ItemMenu dentro de sus propios SuperMenus.
ALTER TABLE `menu_orden_usuario`
  ADD COLUMN `id_super` int(11) DEFAULT NULL AFTER `orden`,
  ADD KEY `fk_mou_super` (`id_super`),
  ADD CONSTRAINT `fk_mou_super` FOREIGN KEY (`id_super`) REFERENCES `menu_super_usuario` (`id_super`) ON DELETE SET NULL;

-- Motivo: nuevo módulo "Configurar Menús" (solo Administrador) para la disponibilidad global.
INSERT INTO `menu` (`nombre`, `icono`, `url`, `padre_id`, `modulo`, `orden`, `estado`) VALUES
('Configurar Menús', 'fa-gear', '/NRC30713-Web/Proyecto_pw/paginas/menu/configurar.html', NULL, 'configmenu', 9, 1);

-- Motivo: menú personal del Administrador — SuperMenu "Frames" con los Frames 1-5.
INSERT INTO `menu_super_usuario` (`id_user`, `nombre`, `orden`) VALUES (1, 'Frames', 101);
SET @super_frames := LAST_INSERT_ID();
INSERT INTO `menu_orden_usuario` (`id_user`, `id_menu`, `orden`, `id_super`)
SELECT 1, m.`id_menu`, m.`orden`, @super_frames
FROM `menu` m
WHERE m.`modulo` IN ('frame1','frame2','frame3','frame4','frame5') AND m.`url` IS NOT NULL
ON DUPLICATE KEY UPDATE `id_super` = @super_frames;
