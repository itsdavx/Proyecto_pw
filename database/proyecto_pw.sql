-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 10-07-2026 a las 17:22:42
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
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activa 0=inactiva',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uk_categoria_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Limpieza'),
(2, 'Comida'),
(3, 'Bebidas'),
(4, 'Tecnología'),
(5, 'Papelería'),
(6, 'Hogar'),
(7, 'Salud'),
(8, 'Otros');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `tipo_identificacion` char(2) NOT NULL COMMENT '04=RUC 05=CEDULA 06=PASAPORTE 07=CONSUMIDOR FINAL 08=IDENTIFICACION EXTERIOR',
  `identificacion` varchar(20) NOT NULL,
  `razon_social` varchar(300) NOT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `tipo_identificacion`, `identificacion`, `razon_social`, `direccion`, `email`, `telefono`, `estado`, `created_by`, `created_at`) VALUES
(1, '07', '9999999999999', 'CONSUMIDOR FINAL', NULL, NULL, NULL, 1, NULL, CURRENT_TIMESTAMP);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_detalle`
--

CREATE TABLE `factura_detalle` (
  `id_detalle` int(11) NOT NULL,
  `id_factura` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `codigo_principal` varchar(25) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `cantidad` decimal(12,6) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL COMMENT 'instantánea de la unidad al emitir',
  `precio_unitario` decimal(12,6) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_total_sin_impuesto` decimal(12,2) NOT NULL,
  `codigo_porcentaje_iva` char(2) NOT NULL,
  `tarifa_iva` decimal(5,2) NOT NULL,
  `base_imponible_iva` decimal(12,2) NOT NULL,
  `valor_iva` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_emisor`
--

CREATE TABLE `factura_emisor` (
  `id_emisor` int(11) NOT NULL,
  `ruc` char(13) NOT NULL,
  `razon_social` varchar(300) NOT NULL,
  `nombre_comercial` varchar(300) DEFAULT NULL,
  `dir_matriz` varchar(300) NOT NULL,
  `ambiente` char(1) NOT NULL DEFAULT '1' COMMENT '1=pruebas 2=produccion',
  `tipo_emision` char(1) NOT NULL DEFAULT '1' COMMENT '1=normal',
  `establecimiento` char(3) NOT NULL DEFAULT '001',
  `punto_emision` char(3) NOT NULL DEFAULT '001',
  `obligado_contabilidad` enum('SI','NO') NOT NULL DEFAULT 'NO',
  `contribuyente_especial` varchar(20) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `factura_emisor`
--
-- NOTA: fila de ejemplo — reemplazar por los datos reales del emisor
-- desde la pestaña "Emisor" del módulo antes de generar facturas.

INSERT INTO `factura_emisor` (`id_emisor`, `ruc`, `razon_social`, `nombre_comercial`, `dir_matriz`, `ambiente`, `tipo_emision`, `establecimiento`, `punto_emision`, `obligado_contabilidad`) VALUES
(1, '9999999999999', 'RAZON SOCIAL DE EJEMPLO S.A.', 'NOMBRE COMERCIAL DE EJEMPLO', 'DIRECCION MATRIZ DE EJEMPLO', '1', '1', '001', '001', 'NO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id_factura` int(11) NOT NULL,
  `ambiente` char(1) NOT NULL COMMENT '1=pruebas 2=produccion',
  `tipo_emision` char(1) NOT NULL DEFAULT '1',
  `establecimiento` char(3) NOT NULL,
  `punto_emision` char(3) NOT NULL,
  `secuencial` char(9) NOT NULL,
  `codigo_numerico` char(8) NOT NULL,
  `clave_acceso` char(49) NOT NULL,
  `fecha_emision` date NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `tipo_identificacion_comprador` char(2) NOT NULL,
  `identificacion_comprador` varchar(20) NOT NULL,
  `razon_social_comprador` varchar(300) NOT NULL,
  `direccion_comprador` varchar(300) DEFAULT NULL,
  `forma_pago` char(2) NOT NULL DEFAULT '01',
  `total_sin_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_iva` decimal(12,2) NOT NULL DEFAULT '0.00',
  `propina` decimal(12,2) NOT NULL DEFAULT '0.00',
  `importe_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `moneda` varchar(10) NOT NULL DEFAULT 'DOLAR',
  `estado` varchar(20) NOT NULL DEFAULT 'GENERADA' COMMENT 'GENERADA (futuro: FIRMADA, ENVIADA, AUTORIZADA, RECHAZADA)',
  `xml_generado` longtext,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
(8, 'Movimientos', 'fa-list', '/NRC30713/Proyecto_pw/paginas/frames/frame1.html', 'frame1', 4, 1),
(9, 'Facturación Electrónica', 'fa-file-invoice', '/NRC30713/Proyecto_pw/paginas/frames/frame2.html', 'frame2', 5, 1),
(10, 'Inventario', 'fa-box', '/NRC30713/Proyecto_pw/paginas/frames/frame3.html', 'frame3', 6, 1),
(11, 'Clientes', 'fa-address-book', '/NRC30713/Proyecto_pw/paginas/frames/frame4.html', 'frame4', 7, 1),
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
(1, 1, 'Módulo Facturación', 103, 0),
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
(5, 1, 'usuarios', 'leer'),
(146, 1, 'frame2', 'crear'),
(147, 1, 'frame2', 'editar'),
(148, 1, 'frame3', 'crear'),
(149, 1, 'frame3', 'editar'),
(150, 1, 'frame3', 'estado'),
(151, 1, 'frame3', 'eliminar'),
(152, 1, 'frame4', 'crear'),
(153, 1, 'frame4', 'editar'),
(154, 1, 'frame4', 'estado'),
(155, 1, 'frame4', 'eliminar');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `codigo_principal` varchar(25) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `precio_unitario` decimal(12,6) NOT NULL,
  `codigo_porcentaje_iva` char(2) NOT NULL DEFAULT '4' COMMENT 'catalogo IVA vigente: 0=0% 4=15% 6=No objeto 7=Exento',
  `id_categoria` int(11) DEFAULT NULL,
  `id_unidad` int(11) NOT NULL DEFAULT '7' COMMENT 'unidad de medida (7=Unidades)',
  `stock` decimal(12,6) NOT NULL DEFAULT '0.000000',
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
-- Estructura de tabla para la tabla `unidades_medida`
--

CREATE TABLE `unidades_medida` (
  `id_unidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `abreviatura` varchar(20) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activa 0=inactiva',
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `uk_unidad_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `unidades_medida`
--

INSERT INTO `unidades_medida` (`id_unidad`, `nombre`, `abreviatura`) VALUES
(1,  'Kilogramos',  'Kg'),
(2,  'Gramos',      'g'),
(3,  'Onzas',       'oz'),
(4,  'Libras',      'lb'),
(5,  'Litros',      'L'),
(6,  'Mililitros',  'mL'),
(7,  'Unidades',    'Und'),
(8,  'Paquetes',    'Paq'),
(9,  'Cajas',       'Caja'),
(10, 'Botellas',    'Bot');

-- --------------------------------------------------------

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
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `uk_cliente_identificacion` (`tipo_identificacion`,`identificacion`),
  ADD KEY `fk_cliente_user` (`created_by`);

--
-- Indices de la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_detalle_factura` (`id_factura`),
  ADD KEY `fk_detalle_producto` (`id_producto`);

--
-- Indices de la tabla `factura_emisor`
--
ALTER TABLE `factura_emisor`
  ADD PRIMARY KEY (`id_emisor`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id_factura`),
  ADD UNIQUE KEY `uk_factura_clave_acceso` (`clave_acceso`),
  ADD UNIQUE KEY `uk_factura_secuencial` (`establecimiento`,`punto_emision`,`secuencial`),
  ADD KEY `fk_factura_cliente` (`id_cliente`),
  ADD KEY `fk_factura_user` (`created_by`);

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
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `uk_producto_codigo` (`codigo_principal`),
  ADD KEY `fk_producto_user` (`created_by`);

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
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `factura_emisor`
--
ALTER TABLE `factura_emisor`
  MODIFY `id_emisor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=156;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT;

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
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_cliente_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  ADD CONSTRAINT `fk_detalle_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_factura_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_factura_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD KEY `fk_producto_categoria` (`id_categoria`),
  ADD KEY `fk_producto_unidad` (`id_unidad`);

ALTER TABLE `productos`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_producto_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_medida` (`id_unidad`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_producto_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

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
