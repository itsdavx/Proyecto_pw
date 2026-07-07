-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 07-07-2026 a las 15:23:53
-- Versión del servidor: 8.0.17
-- Versión de PHP: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyecto_pw`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accesos_ocultos_usuario`
--

CREATE TABLE `accesos_ocultos_usuario` (
  `id_user` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `accesos_ocultos_usuario`
--

INSERT INTO `accesos_ocultos_usuario` (`id_user`, `id_menu`) VALUES
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `frases`
--

CREATE TABLE `frases` (
  `id` int(11) NOT NULL,
  `frase` varchar(500) NOT NULL,
  `autor` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `frases`
--

INSERT INTO `frases` (`id`, `frase`, `autor`, `estado`) VALUES
(1, 'La disciplina supera al talento cuando el talento no es disciplinado.', 'Anónimo', 1),
(2, 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', 'Robert Collier', 1),
(3, 'No cuentes los días, haz que los días cuenten.', 'Muhammad Ali', 1),
(4, 'La mejor manera de predecir el futuro es crearlo.', 'Peter Drucker', 1),
(5, 'El único modo de hacer un gran trabajo es amar lo que haces.', 'Steve Jobs', 1),
(6, 'No importa lo lento que vayas mientras no te detengas.', 'Confucio', 1),
(7, 'Cree que puedes y ya estarás a medio camino.', 'Theodore Roosevelt', 1),
(8, 'La constancia es el camino más corto hacia el logro.', 'Anónimo', 1),
(9, 'La disciplina es el puente entre las metas y los logros.', 'Jim Rohn', 1),
(10, 'El aprendizaje continuo es la clave del éxito en la era digital.', 'Bill Gates', 1),
(11, 'La tecnología es mejor cuando conecta a las personas.', 'Matt Mullenweg', 1),
(12, 'Un buen líder inspira a otros a superar sus propios límites.', 'Anónimo', 1),
(13, 'El esfuerzo constante transforma lo imposible en inevitable.', 'Anónimo', 1),
(14, 'La calidad nunca es un accidente; es el resultado del esfuerzo inteligente.', 'John Ruskin', 1),
(15, 'El código limpio siempre parece escrito por alguien que se preocupa.', 'Robert C. Martin', 1),
(16, 'Invertir en conocimiento paga los mejores intereses.', 'Benjamin Franklin', 1),
(17, 'La simplicidad es la máxima sofisticación.', 'Leonardo da Vinci', 1),
(18, 'Liderar es servir con el ejemplo, no con la autoridad.', 'Anónimo', 1),
(19, 'Cada línea de código es una oportunidad de mejorar.', 'Anónimo', 1),
(20, 'El desarrollo personal comienza donde termina la zona de confort.', 'Anónimo', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `login_intentos`
--

CREATE TABLE `login_intentos` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `intentos` tinyint(4) NOT NULL DEFAULT '0',
  `bloqueado` tinyint(1) NOT NULL DEFAULT '0',
  `ultimo_intento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu`
--

CREATE TABLE `menu` (
  `id_menu` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `icono` varchar(100) DEFAULT NULL,
  `url` varchar(255) NOT NULL COMMENT 'pagina del Frame que abre el ItemMenu',
  `modulo` varchar(50) NOT NULL COMMENT 'modulo RBAC (permisos_rol / registro de frames)',
  `orden` smallint(6) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `menu`
--

INSERT INTO `menu` (`id_menu`, `nombre`, `icono`, `url`, `modulo`, `orden`, `estado`) VALUES
(1, 'Dashboard', 'fa-gauge', '/NRC30713/Proyecto_pw/paginas/dashboard/index.html', 'dashboard', 1, 1),
(2, 'Usuarios', 'fa-users', '/NRC30713/Proyecto_pw/paginas/usuarios/index.html', 'usuarios', 2, 1),
(3, 'Roles', 'fa-id-badge', '/NRC30713/Proyecto_pw/paginas/roles/index.html', 'roles', 2, 1),
(4, 'Permisos', 'fa-lock', '/NRC30713/Proyecto_pw/paginas/permisos/index.html', 'permisos', 3, 1),
(5, 'Menu', 'fa-bars', '/NRC30713/Proyecto_pw/paginas/menu/index.html', 'menu', 4, 1),
(6, 'Cambiar Password', 'fa-key', '/NRC30713/Proyecto_pw/paginas/perfil/frmCambiarPassword.html', 'perfil', 1, 1),
(7, 'Ver Perfil', 'fa-circle-user', '/NRC30713/Proyecto_pw/paginas/perfil/frmVerPerfil.html', 'perfil', 0, 1),
(8, 'Frame 1', 'fa-list', '/NRC30713/Proyecto_pw/paginas/frames/frame1.html', 'frame1', 4, 1),
(9, 'Frame 2', 'fa-chart-bar', '/NRC30713/Proyecto_pw/paginas/frames/frame2.html', 'frame2', 5, 1),
(10, 'Frame 3', 'fa-chart-bar', '/NRC30713/Proyecto_pw/paginas/frames/frame3.html', 'frame3', 6, 1),
(11, 'Frame 4', 'fa-chart-bar', '/NRC30713/Proyecto_pw/paginas/frames/frame4.html', 'frame4', 7, 1),
(12, 'Frame 5', 'fa-chart-bar', '/NRC30713/Proyecto_pw/paginas/frames/frame5.html', 'frame5', 8, 1),
(13, 'Configurar Menús', 'fa-gear', '/NRC30713/Proyecto_pw/paginas/menu/configurar.html', 'configmenu', 9, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_orden_usuario`
--

CREATE TABLE `menu_orden_usuario` (
  `id_user` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  `orden` smallint(6) NOT NULL DEFAULT '0',
  `id_super` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `menu_orden_usuario`
--

INSERT INTO `menu_orden_usuario` (`id_user`, `id_menu`, `orden`, `id_super`) VALUES
(1, 1, 1, NULL),
(1, 2, 1, 3),
(1, 3, 2, 3),
(1, 4, 3, 3),
(1, 5, 3, 2),
(1, 6, 2, 2),
(1, 7, 1, 2),
(1, 8, 1, 1),
(1, 9, 2, 1),
(1, 10, 3, 1),
(1, 11, 4, 1),
(1, 12, 5, 1),
(1, 13, 4, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_super_usuario`
--

CREATE TABLE `menu_super_usuario` (
  `id_super` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `orden` smallint(6) NOT NULL DEFAULT '0',
  `protegido` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'SuperMenu obligatorio (Mi Perfil): no puede eliminarse, solo reorganizarse'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `menu_super_usuario`
--

INSERT INTO `menu_super_usuario` (`id_super`, `id_user`, `nombre`, `orden`, `protegido`) VALUES
(1, 1, 'Frames', 103, 0),
(2, 1, 'Mi perfil', 101, 1),
(3, 1, 'Administración', 102, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos_rol`
--

CREATE TABLE `permisos_rol` (
  `id` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `modulo` varchar(50) NOT NULL COMMENT 'modulo del registro de frames (servidor/permisos/registro.php)',
  `accion` varchar(50) NOT NULL COMMENT 'leer|crear|editar|eliminar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `permisos_rol`
--

INSERT INTO `permisos_rol` (`id`, `id_rol`, `modulo`, `accion`) VALUES
(2, 1, 'dashboard', 'crear'),
(3, 1, 'dashboard', 'editar'),
(4, 1, 'dashboard', 'eliminar'),
(1, 1, 'dashboard', 'leer'),
(24, 1, 'frame1', 'crear'),
(25, 1, 'frame1', 'editar'),
(26, 1, 'frame1', 'eliminar'),
(23, 1, 'frame1', 'leer'),
(27, 1, 'frame2', 'leer'),
(28, 1, 'frame3', 'leer'),
(29, 1, 'frame4', 'leer'),
(30, 1, 'frame5', 'leer'),
(18, 1, 'menu', 'crear'),
(19, 1, 'menu', 'editar'),
(20, 1, 'menu', 'eliminar'),
(17, 1, 'menu', 'leer'),
(115, 1, 'menu', 'renombrar'),
(145, 1, 'menu', 'reordenar'),
(22, 1, 'perfil', 'editar'),
(21, 1, 'perfil', 'leer'),
(14, 1, 'permisos', 'crear'),
(15, 1, 'permisos', 'editar'),
(16, 1, 'permisos', 'eliminar'),
(13, 1, 'permisos', 'leer'),
(10, 1, 'roles', 'crear'),
(11, 1, 'roles', 'editar'),
(12, 1, 'roles', 'eliminar'),
(9, 1, 'roles', 'leer'),
(96, 1, 'usuarios', 'cambiar_rol'),
(6, 1, 'usuarios', 'crear'),
(95, 1, 'usuarios', 'desactivar'),
(7, 1, 'usuarios', 'editar'),
(8, 1, 'usuarios', 'eliminar'),
(5, 1, 'usuarios', 'leer');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pw_user`
--

CREATE TABLE `pw_user` (
  `id_user` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'bcrypt — password_hash()',
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo',
  `primer_login` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=forzar cambio de contrasena',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `pw_user`
--

INSERT INTO `pw_user` (`id_user`, `username`, `password`, `nombre`, `email`, `id_rol`, `estado`, `primer_login`, `created_by`, `created_at`) VALUES
(1, 'admin', '$2y$12$IZPwpujfByoJVcrm2Vjt4ur5YNfgZGvce1Hj6x8kpzz3JHOc7dIqG', 'Administrador del Sistema', 'admin@empresa.local', 1, 1, 0, NULL, '2026-06-30 08:29:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `estado`) VALUES
(1, 'Admin', 'Administrador del sistema. No eliminar.', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `token` char(64) NOT NULL COMMENT 'bin2hex(random_bytes(32))',
  `id_user` int(11) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id_tarea` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accesos_ocultos_usuario`
--
ALTER TABLE `accesos_ocultos_usuario`
  ADD PRIMARY KEY (`id_user`,`id_menu`),
  ADD KEY `fk_aou_menu` (`id_menu`);

--
-- Indices de la tabla `frases`
--
ALTER TABLE `frases`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `login_intentos`
--
ALTER TABLE `login_intentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_username_ip` (`username`,`ip`);

--
-- Indices de la tabla `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id_menu`),
  ADD UNIQUE KEY `uk_menu_url` (`url`);

--
-- Indices de la tabla `menu_orden_usuario`
--
ALTER TABLE `menu_orden_usuario`
  ADD PRIMARY KEY (`id_user`,`id_menu`),
  ADD KEY `fk_mou_super` (`id_super`),
  ADD KEY `fk_mou_menu` (`id_menu`);

--
-- Indices de la tabla `menu_super_usuario`
--
ALTER TABLE `menu_super_usuario`
  ADD PRIMARY KEY (`id_super`),
  ADD KEY `fk_msu_user` (`id_user`);

--
-- Indices de la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_rol_modulo_accion` (`id_rol`,`modulo`,`accion`);

--
-- Indices de la tabla `pw_user`
--
ALTER TABLE `pw_user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `uk_username` (`username`),
  ADD UNIQUE KEY `uk_email` (`email`),
  ADD KEY `fk_user_rol` (`id_rol`),
  ADD KEY `fk_user_creator` (`created_by`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `uk_nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`token`),
  ADD KEY `fk_ses_user` (`id_user`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id_tarea`),
  ADD KEY `fk_tarea_user` (`created_by`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `frases`
--
ALTER TABLE `frases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `login_intentos`
--
ALTER TABLE `login_intentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `menu`
--
ALTER TABLE `menu`
  MODIFY `id_menu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `menu_super_usuario`
--
ALTER TABLE `menu_super_usuario`
  MODIFY `id_super` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- AUTO_INCREMENT de la tabla `pw_user`
--
ALTER TABLE `pw_user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id_tarea` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `accesos_ocultos_usuario`
--
ALTER TABLE `accesos_ocultos_usuario`
  ADD CONSTRAINT `fk_aou_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aou_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `menu_orden_usuario`
--
ALTER TABLE `menu_orden_usuario`
  ADD CONSTRAINT `fk_mou_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mou_super` FOREIGN KEY (`id_super`) REFERENCES `menu_super_usuario` (`id_super`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mou_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `menu_super_usuario`
--
ALTER TABLE `menu_super_usuario`
  ADD CONSTRAINT `fk_msu_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  ADD CONSTRAINT `fk_pr_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pw_user`
--
ALTER TABLE `pw_user`
  ADD CONSTRAINT `fk_user_creator` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `fk_ses_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `fk_tarea_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
