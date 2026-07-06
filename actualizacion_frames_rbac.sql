-- ============================================================
-- SCRIPT INCREMENTAL — Frames de ejemplo, RBAC y menú por usuario
-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre la BD `proyecto_pw`.
-- No elimina ni modifica tablas, columnas ni datos existentes.
-- ============================================================

-- Motivo: tabla para el CRUD de tareas del Frame 1.
CREATE TABLE IF NOT EXISTS `tareas` (
  `id_tarea` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tarea`),
  KEY `fk_tarea_user` (`created_by`),
  CONSTRAINT `fk_tarea_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Motivo: orden personalizado del menú por usuario (usuarios normales solo reordenan).
CREATE TABLE IF NOT EXISTS `menu_orden_usuario` (
  `id_user` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  `orden` smallint(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_user`, `id_menu`),
  CONSTRAINT `fk_mou_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `fk_mou_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Motivo: nuevos ítems de menú — Ver Perfil (bajo Mi Perfil, id 8) y Frames 1-5.
INSERT INTO `menu` (`nombre`, `icono`, `url`, `padre_id`, `modulo`, `orden`, `estado`) VALUES
('Ver Perfil', 'fa-circle-user', '/NRC30713-Web/Proyecto_pw/paginas/perfil/frmVerPerfil.html', 8, 'perfil', 0, 1),
('Frame 1', 'fa-list',      '/NRC30713-Web/Proyecto_pw/paginas/frames/frame1.html', NULL, 'frame1', 4, 1),
('Frame 2', 'fa-chart-bar', '/NRC30713-Web/Proyecto_pw/paginas/frames/frame2.html', NULL, 'frame2', 5, 1),
('Frame 3', 'fa-chart-bar', '/NRC30713-Web/Proyecto_pw/paginas/frames/frame3.html', NULL, 'frame3', 6, 1),
('Frame 4', 'fa-chart-bar', '/NRC30713-Web/Proyecto_pw/paginas/frames/frame4.html', NULL, 'frame4', 7, 1),
('Frame 5', 'fa-chart-bar', '/NRC30713-Web/Proyecto_pw/paginas/frames/frame5.html', NULL, 'frame5', 8, 1);

-- Motivo: el Admin necesita filas en permisos_rol porque el servidor valida contra la tabla.
INSERT IGNORE INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(1, 'frame1', 'leer'), (1, 'frame1', 'crear'), (1, 'frame1', 'editar'), (1, 'frame1', 'eliminar'),
(1, 'frame2', 'leer'), (1, 'frame3', 'leer'), (1, 'frame4', 'leer'), (1, 'frame5', 'leer');

-- Motivo: permisos base para todos los roles (Dashboard, Mi Perfil y reordenar su menú).
INSERT IGNORE INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(2, 'dashboard', 'leer'), (2, 'perfil', 'leer'), (2, 'perfil', 'editar'), (2, 'menu', 'leer'),
(3, 'dashboard', 'leer'), (3, 'perfil', 'leer'), (3, 'perfil', 'editar'), (3, 'menu', 'leer'),
(4, 'dashboard', 'leer'), (4, 'perfil', 'leer'), (4, 'perfil', 'editar'), (4, 'menu', 'leer'),
(5, 'dashboard', 'leer'), (5, 'perfil', 'leer'), (5, 'perfil', 'editar'), (5, 'menu', 'leer'),
(6, 'dashboard', 'leer'), (6, 'perfil', 'leer'), (6, 'perfil', 'editar'), (6, 'menu', 'leer'),
(7, 'dashboard', 'leer'), (7, 'perfil', 'leer'), (7, 'perfil', 'editar'), (7, 'menu', 'leer'),
(8, 'dashboard', 'leer'), (8, 'perfil', 'leer'), (8, 'perfil', 'editar'), (8, 'menu', 'leer');

-- Motivo: Frame 1 según el ejemplo — Rol1 sin eliminar, Rol2 completo, Rol3 sin acceso.
INSERT IGNORE INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(2, 'frame1', 'leer'), (2, 'frame1', 'crear'), (2, 'frame1', 'editar'),
(3, 'frame1', 'leer'), (3, 'frame1', 'crear'), (3, 'frame1', 'editar'), (3, 'frame1', 'eliminar');

-- Motivo: distribución FIJA de Frames 2-5 entre Rol1..Rol7 (ids 2..8); cada rol ve al menos un frame.
-- Rol1: F1,F2,F5 | Rol2: F1,F3 | Rol3: F2 | Rol4: F3,F4 | Rol5: F2,F4 | Rol6: F3,F5 | Rol7: F4,F5
INSERT IGNORE INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(2, 'frame2', 'leer'), (4, 'frame2', 'leer'), (6, 'frame2', 'leer'),
(3, 'frame3', 'leer'), (5, 'frame3', 'leer'), (7, 'frame3', 'leer'),
(5, 'frame4', 'leer'), (6, 'frame4', 'leer'), (8, 'frame4', 'leer'),
(7, 'frame5', 'leer'), (8, 'frame5', 'leer'), (2, 'frame5', 'leer');
