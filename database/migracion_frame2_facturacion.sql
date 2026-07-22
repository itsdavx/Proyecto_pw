-- =====================================================================
-- Migración — Frame 2: Facturación Electrónica SRI (Ecuador)
-- Agrega las tablas necesarias para el nuevo módulo. No modifica ni
-- elimina ninguna tabla existente. Ejecutar una sola vez sobre la BD
-- ya desplegada (para una instalación nueva, usar directamente el
-- dump actualizado en database/proyecto_pw.sql).
-- Compatible con MySQL/MariaDB (phpMyAdmin > Importar/SQL).
-- =====================================================================

SET AUTOCOMMIT = 0;
START TRANSACTION;

-- ---------------------------------------------------------------------
-- Clientes (comprador de la factura)
-- ---------------------------------------------------------------------
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_identificacion` char(2) NOT NULL COMMENT '04=RUC 05=CEDULA 06=PASAPORTE 07=CONSUMIDOR FINAL 08=IDENTIFICACION EXTERIOR',
  `identificacion` varchar(20) NOT NULL,
  `razon_social` varchar(300) NOT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uk_cliente_identificacion` (`tipo_identificacion`,`identificacion`),
  KEY `fk_cliente_user` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ---------------------------------------------------------------------
-- Productos (catálogo facturable)
-- ---------------------------------------------------------------------
CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_principal` varchar(25) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `precio_unitario` decimal(12,6) NOT NULL,
  `codigo_porcentaje_iva` char(2) NOT NULL DEFAULT '4' COMMENT 'catalogo IVA vigente: 0=0% 4=15% 6=No objeto 7=Exento',
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `uk_producto_codigo` (`codigo_principal`),
  KEY `fk_producto_user` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ---------------------------------------------------------------------
-- Datos del emisor (fila única, id_emisor = 1)
-- ---------------------------------------------------------------------
CREATE TABLE `factura_emisor` (
  `id_emisor` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_emisor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ---------------------------------------------------------------------
-- Facturas (cabecera) — codDoc 01, inmutables una vez generadas
-- ---------------------------------------------------------------------
CREATE TABLE `facturas` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `uk_factura_clave_acceso` (`clave_acceso`),
  UNIQUE KEY `uk_factura_secuencial` (`establecimiento`,`punto_emision`,`secuencial`),
  KEY `fk_factura_cliente` (`id_cliente`),
  KEY `fk_factura_user` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ---------------------------------------------------------------------
-- Detalle de factura (múltiples ítems por factura)
-- ---------------------------------------------------------------------
CREATE TABLE `factura_detalle` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_factura` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `codigo_principal` varchar(25) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `cantidad` decimal(12,6) NOT NULL,
  `precio_unitario` decimal(12,6) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_total_sin_impuesto` decimal(12,2) NOT NULL,
  `codigo_porcentaje_iva` char(2) NOT NULL,
  `tarifa_iva` decimal(5,2) NOT NULL,
  `base_imponible_iva` decimal(12,2) NOT NULL,
  `valor_iva` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_factura` (`id_factura`),
  KEY `fk_detalle_producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ---------------------------------------------------------------------
-- Llaves foráneas
-- ---------------------------------------------------------------------
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_cliente_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `productos`
  ADD CONSTRAINT `fk_producto_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_factura_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_factura_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `factura_detalle`
  ADD CONSTRAINT `fk_detalle_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- Datos base: cliente "Consumidor Final" (obligatorio, identificación
-- fija 9999999999999) y fila única de configuración del emisor con
-- valores de ejemplo — deben reemplazarse por los datos reales de la
-- empresa desde la pestaña "Emisor" del módulo antes de emitir facturas.
-- ---------------------------------------------------------------------
INSERT INTO `clientes` (`tipo_identificacion`, `identificacion`, `razon_social`, `estado`) VALUES
('07', '9999999999999', 'CONSUMIDOR FINAL', 1);

INSERT INTO `factura_emisor`
    (`id_emisor`, `ruc`, `razon_social`, `nombre_comercial`, `dir_matriz`, `ambiente`, `tipo_emision`, `establecimiento`, `punto_emision`, `obligado_contabilidad`)
VALUES
    (1, '9999999999999', 'RAZON SOCIAL DE EJEMPLO S.A.', 'NOMBRE COMERCIAL DE EJEMPLO', 'DIRECCION MATRIZ DE EJEMPLO', '1', '1', '001', '001', 'NO');

-- ---------------------------------------------------------------------
-- Registro RBAC: acciones nuevas del módulo (crear/editar/estado).
-- El rol Administrador (id_rol = 1) recibe permisos explícitos por
-- consistencia con el resto del catálogo, aunque el sistema ya lo
-- exime de la verificación (bypass id_rol === 1 en config.php).
-- ---------------------------------------------------------------------
INSERT INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(1, 'frame2', 'crear'),
(1, 'frame2', 'editar'),
(1, 'frame2', 'estado');

-- Renombrar el ítem de menú de Frame 2 para reflejar su nuevo propósito
-- (mismo id_menu, misma url — no se registra un módulo nuevo). El icono
-- propio (fa-file-invoice) lo distingue de los demás Frames en el menú.
UPDATE `menu` SET `nombre` = 'Facturación Electrónica', `icono` = 'fa-file-invoice' WHERE `modulo` = 'frame2';

COMMIT;
