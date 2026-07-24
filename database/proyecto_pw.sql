-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 24-07-2026 a las 15:47:16
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
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activa 0=inactiva'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `estado`) VALUES
(1, 'Limpieza', 1),
(2, 'Comida', 1),
(3, 'Bebidas', 1),
(4, 'Tecnología', 1),
(5, 'Papelería', 1),
(6, 'Hogar', 1),
(7, 'Salud', 1),
(8, 'Otros', 1);

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
(1, '07', '9999999999999', 'CONSUMIDOR FINAL', NULL, NULL, NULL, 1, NULL, '2026-07-13 10:43:06'),
(4, '04', '0992765431001', 'IMPORTADORA COMERCIAL ANDINA S.A.', 'Av. Francisco de Orellana y Alberto Borges, Edif. Centrum, Guayaquil', 'compras@comercialandina.com.ec', '042683450', 1, 1, '2026-07-23 17:48:40'),
(5, '04', '1791234560001', 'FERRETERÍA Y ACABADOS EL CONSTRUCTOR CÍA. LTDA.', 'Av. Maldonado S12-345 y Alonso de Angulo, Quito', 'ventas@elconstructor.ec', '023456712', 1, 1, '2026-07-23 17:48:40'),
(6, '04', '1890345671001', 'TECNOSOLUCIONES DEL AUSTRO S.A.', 'Av. Remigio Crespo 4-56 y Guayas, Cuenca', 'info@tecnosoluciones.com.ec', '074082310', 1, 1, '2026-07-23 17:48:40'),
(7, '04', '0993018745001', 'DISTRIBUIDORA DE ALIMENTOS LA PRADERA S.A.', 'Km 8.5 Vía Daule, Parque Industrial Pascuales, Guayaquil', 'pedidos@lapradera.com.ec', '046002145', 1, 1, '2026-07-23 17:48:40'),
(8, '05', '1710345678', 'María Fernanda Cevallos Torres', 'Calle Los Ríos N24-12 y Foch, Quito', 'mariaf.cevallos@gmail.com', '0991234576', 1, 1, '2026-07-23 17:48:40'),
(9, '05', '0918273645', 'Juan Carlos Paredes Molina', 'Cdla. Kennedy Norte, Calle San Roque 210, Guayaquil', 'jc.paredes@hotmail.com', '0987651234', 1, 1, '2026-07-23 17:48:40'),
(10, '05', '0104567823', 'Andrea Estefanía Vaca Naranjo', 'Av. Solano 3-45 y Federico Malo, Cuenca', 'andrea.vaca@outlook.com', '0995847612', 1, 1, '2026-07-23 17:48:40'),
(11, '05', '1312045678', 'Diego Armando Suárez Herrera', 'Av. 4 de Noviembre y Malecón, Manta', 'diego.suarez@yahoo.es', '0968473921', 1, 1, '2026-07-23 17:48:40');

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

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id_factura`, `ambiente`, `tipo_emision`, `establecimiento`, `punto_emision`, `secuencial`, `codigo_numerico`, `clave_acceso`, `fecha_emision`, `id_cliente`, `tipo_identificacion_comprador`, `identificacion_comprador`, `razon_social_comprador`, `direccion_comprador`, `forma_pago`, `total_sin_impuestos`, `total_descuento`, `total_iva`, `propina`, `importe_total`, `moneda`, `estado`, `xml_generado`, `created_by`, `created_at`) VALUES
(4, '1', '1', '001', '001', '000000001', '53432017', '1206202601179174582300110010010000000015343201711', '2026-06-12', 4, '04', '0992765431001', 'IMPORTADORA COMERCIAL ANDINA S.A.', 'Av. Francisco de Orellana y Alberto Borges, Edif. Centrum, Guayaquil', '20', '106.62', '3.38', '16.00', '0.00', '122.62', 'DOLAR', 'GENERADA', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<factura id=\"comprobante\" version=\"1.1.0\">\n  <infoTributaria>\n    <ambiente>1</ambiente>\n    <tipoEmision>1</tipoEmision>\n    <razonSocial>DISTRIBUIDORA COMERCIAL NEXUS S.A.</razonSocial>\n    <nombreComercial>NEXUS Distribuciones</nombreComercial>\n    <ruc>1791745823001</ruc>\n    <claveAcceso>1206202601179174582300110010010000000015343201711</claveAcceso>\n    <codDoc>01</codDoc>\n    <estab>001</estab>\n    <ptoEmi>001</ptoEmi>\n    <secuencial>000000001</secuencial>\n    <dirMatriz>Av. República del Salvador N36-84 y Naciones Unidas, Quito</dirMatriz>\n  </infoTributaria>\n  <infoFactura>\n    <fechaEmision>12/06/2026</fechaEmision>\n    <obligadoContabilidad>SI</obligadoContabilidad>\n    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>\n    <razonSocialComprador>IMPORTADORA COMERCIAL ANDINA S.A.</razonSocialComprador>\n    <identificacionComprador>0992765431001</identificacionComprador>\n    <direccionComprador>Av. Francisco de Orellana y Alberto Borges, Edif. Centrum, Guayaquil</direccionComprador>\n    <totalSinImpuestos>106.62</totalSinImpuestos>\n    <totalDescuento>3.38</totalDescuento>\n    <totalConImpuestos>\n      <totalImpuesto>\n        <codigo>2</codigo>\n        <codigoPorcentaje>4</codigoPorcentaje>\n        <baseImponible>106.62</baseImponible>\n        <valor>16.00</valor>\n      </totalImpuesto>\n    </totalConImpuestos>\n    <propina>0.00</propina>\n    <importeTotal>122.62</importeTotal>\n    <moneda>DOLAR</moneda>\n    <pagos>\n      <pago>\n        <formaPago>20</formaPago>\n        <total>122.62</total>\n      </pago>\n    </pagos>\n  </infoFactura>\n  <detalles>\n    <detalle>\n      <codigoPrincipal>TEC-001</codigoPrincipal>\n      <descripcion>Mouse Óptico Inalámbrico USB</descripcion>\n      <cantidad>5.000000</cantidad>\n      <precioUnitario>8.500000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>42.50</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>42.50</baseImponible>\n          <valor>6.38</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>TEC-003</codigoPrincipal>\n      <descripcion>Memoria Flash USB 32 GB</descripcion>\n      <cantidad>10.000000</cantidad>\n      <precioUnitario>6.750000</precioUnitario>\n      <descuento>3.38</descuento>\n      <precioTotalSinImpuesto>64.12</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>64.12</baseImponible>\n          <valor>9.62</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n  </detalles>\n</factura>\n', 4, '2026-06-12 10:30:00'),
(5, '1', '1', '001', '001', '000000002', '01843553', '2506202601179174582300110010010000000020184355312', '2026-06-25', 8, '05', '1710345678', 'María Fernanda Cevallos Torres', 'Calle Los Ríos N24-12 y Foch, Quito', '19', '21.65', '0.00', '2.54', '0.00', '24.19', 'DOLAR', 'GENERADA', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<factura id=\"comprobante\" version=\"1.1.0\">\n  <infoTributaria>\n    <ambiente>1</ambiente>\n    <tipoEmision>1</tipoEmision>\n    <razonSocial>DISTRIBUIDORA COMERCIAL NEXUS S.A.</razonSocial>\n    <nombreComercial>NEXUS Distribuciones</nombreComercial>\n    <ruc>1791745823001</ruc>\n    <claveAcceso>2506202601179174582300110010010000000020184355312</claveAcceso>\n    <codDoc>01</codDoc>\n    <estab>001</estab>\n    <ptoEmi>001</ptoEmi>\n    <secuencial>000000002</secuencial>\n    <dirMatriz>Av. República del Salvador N36-84 y Naciones Unidas, Quito</dirMatriz>\n  </infoTributaria>\n  <infoFactura>\n    <fechaEmision>25/06/2026</fechaEmision>\n    <obligadoContabilidad>SI</obligadoContabilidad>\n    <tipoIdentificacionComprador>05</tipoIdentificacionComprador>\n    <razonSocialComprador>María Fernanda Cevallos Torres</razonSocialComprador>\n    <identificacionComprador>1710345678</identificacionComprador>\n    <direccionComprador>Calle Los Ríos N24-12 y Foch, Quito</direccionComprador>\n    <totalSinImpuestos>21.65</totalSinImpuestos>\n    <totalDescuento>0.00</totalDescuento>\n    <totalConImpuestos>\n      <totalImpuesto>\n        <codigo>2</codigo>\n        <codigoPorcentaje>4</codigoPorcentaje>\n        <baseImponible>16.95</baseImponible>\n        <valor>2.54</valor>\n      </totalImpuesto>\n      <totalImpuesto>\n        <codigo>2</codigo>\n        <codigoPorcentaje>0</codigoPorcentaje>\n        <baseImponible>4.70</baseImponible>\n        <valor>0.00</valor>\n      </totalImpuesto>\n    </totalConImpuestos>\n    <propina>0.00</propina>\n    <importeTotal>24.19</importeTotal>\n    <moneda>DOLAR</moneda>\n    <pagos>\n      <pago>\n        <formaPago>19</formaPago>\n        <total>24.19</total>\n      </pago>\n    </pagos>\n  </infoFactura>\n  <detalles>\n    <detalle>\n      <codigoPrincipal>LIMP-001</codigoPrincipal>\n      <descripcion>Desinfectante Multiusos Lavanda 1 L</descripcion>\n      <cantidad>3.000000</cantidad>\n      <precioUnitario>2.850000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>8.55</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>8.55</baseImponible>\n          <valor>1.28</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>BEB-002</codigoPrincipal>\n      <descripcion>Gaseosa Cola 1.5 L</descripcion>\n      <cantidad>6.000000</cantidad>\n      <precioUnitario>1.400000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>8.40</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>8.40</baseImponible>\n          <valor>1.26</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>ALI-001</codigoPrincipal>\n      <descripcion>Arroz Flor Grano Largo 2 Kg</descripcion>\n      <cantidad>2.000000</cantidad>\n      <precioUnitario>2.350000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>4.70</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>0</codigoPorcentaje>\n          <tarifa>0.00</tarifa>\n          <baseImponible>4.70</baseImponible>\n          <valor>0.00</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n  </detalles>\n</factura>\n', 4, '2026-06-25 10:55:00'),
(6, '1', '1', '001', '001', '000000003', '04819156', '0307202601179174582300110010010000000030481915616', '2026-07-03', 5, '04', '1791234560001', 'FERRETERÍA Y ACABADOS EL CONSTRUCTOR CÍA. LTDA.', 'Av. Maldonado S12-345 y Alonso de Angulo, Quito', '01', '90.50', '3.50', '13.58', '0.00', '104.08', 'DOLAR', 'GENERADA', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<factura id=\"comprobante\" version=\"1.1.0\">\n  <infoTributaria>\n    <ambiente>1</ambiente>\n    <tipoEmision>1</tipoEmision>\n    <razonSocial>DISTRIBUIDORA COMERCIAL NEXUS S.A.</razonSocial>\n    <nombreComercial>NEXUS Distribuciones</nombreComercial>\n    <ruc>1791745823001</ruc>\n    <claveAcceso>0307202601179174582300110010010000000030481915616</claveAcceso>\n    <codDoc>01</codDoc>\n    <estab>001</estab>\n    <ptoEmi>001</ptoEmi>\n    <secuencial>000000003</secuencial>\n    <dirMatriz>Av. República del Salvador N36-84 y Naciones Unidas, Quito</dirMatriz>\n  </infoTributaria>\n  <infoFactura>\n    <fechaEmision>03/07/2026</fechaEmision>\n    <obligadoContabilidad>SI</obligadoContabilidad>\n    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>\n    <razonSocialComprador>FERRETERÍA Y ACABADOS EL CONSTRUCTOR CÍA. LTDA.</razonSocialComprador>\n    <identificacionComprador>1791234560001</identificacionComprador>\n    <direccionComprador>Av. Maldonado S12-345 y Alonso de Angulo, Quito</direccionComprador>\n    <totalSinImpuestos>90.50</totalSinImpuestos>\n    <totalDescuento>3.50</totalDescuento>\n    <totalConImpuestos>\n      <totalImpuesto>\n        <codigo>2</codigo>\n        <codigoPorcentaje>4</codigoPorcentaje>\n        <baseImponible>90.50</baseImponible>\n        <valor>13.58</valor>\n      </totalImpuesto>\n    </totalConImpuestos>\n    <propina>0.00</propina>\n    <importeTotal>104.08</importeTotal>\n    <moneda>DOLAR</moneda>\n    <pagos>\n      <pago>\n        <formaPago>01</formaPago>\n        <total>104.08</total>\n      </pago>\n    </pagos>\n  </infoFactura>\n  <detalles>\n    <detalle>\n      <codigoPrincipal>PAP-001</codigoPrincipal>\n      <descripcion>Resma Papel Bond A4 75 g (500 hojas)</descripcion>\n      <cantidad>10.000000</cantidad>\n      <precioUnitario>3.800000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>38.00</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>38.00</baseImponible>\n          <valor>5.70</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>PAP-002</codigoPrincipal>\n      <descripcion>Esferográfico Punta Fina Azul (caja x12)</descripcion>\n      <cantidad>5.000000</cantidad>\n      <precioUnitario>4.200000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>21.00</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>21.00</baseImponible>\n          <valor>3.15</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>HOG-001</codigoPrincipal>\n      <descripcion>Foco LED 9W Luz Blanca E27</descripcion>\n      <cantidad>20.000000</cantidad>\n      <precioUnitario>1.750000</precioUnitario>\n      <descuento>3.50</descuento>\n      <precioTotalSinImpuesto>31.50</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>31.50</baseImponible>\n          <valor>4.73</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n  </detalles>\n</factura>\n', 3, '2026-07-03 10:26:00'),
(7, '1', '1', '001', '001', '000000004', '68749000', '1507202601179174582300110010010000000046874900013', '2026-07-15', 9, '05', '0918273645', 'Juan Carlos Paredes Molina', 'Cdla. Kennedy Norte, Calle San Roque 210, Guayaquil', '16', '45.80', '0.00', '0.00', '0.00', '45.80', 'DOLAR', 'GENERADA', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<factura id=\"comprobante\" version=\"1.1.0\">\n  <infoTributaria>\n    <ambiente>1</ambiente>\n    <tipoEmision>1</tipoEmision>\n    <razonSocial>DISTRIBUIDORA COMERCIAL NEXUS S.A.</razonSocial>\n    <nombreComercial>NEXUS Distribuciones</nombreComercial>\n    <ruc>1791745823001</ruc>\n    <claveAcceso>1507202601179174582300110010010000000046874900013</claveAcceso>\n    <codDoc>01</codDoc>\n    <estab>001</estab>\n    <ptoEmi>001</ptoEmi>\n    <secuencial>000000004</secuencial>\n    <dirMatriz>Av. República del Salvador N36-84 y Naciones Unidas, Quito</dirMatriz>\n  </infoTributaria>\n  <infoFactura>\n    <fechaEmision>15/07/2026</fechaEmision>\n    <obligadoContabilidad>SI</obligadoContabilidad>\n    <tipoIdentificacionComprador>05</tipoIdentificacionComprador>\n    <razonSocialComprador>Juan Carlos Paredes Molina</razonSocialComprador>\n    <identificacionComprador>0918273645</identificacionComprador>\n    <direccionComprador>Cdla. Kennedy Norte, Calle San Roque 210, Guayaquil</direccionComprador>\n    <totalSinImpuestos>45.80</totalSinImpuestos>\n    <totalDescuento>0.00</totalDescuento>\n    <totalConImpuestos>\n      <totalImpuesto>\n        <codigo>2</codigo>\n        <codigoPorcentaje>0</codigoPorcentaje>\n        <baseImponible>45.80</baseImponible>\n        <valor>0.00</valor>\n      </totalImpuesto>\n    </totalConImpuestos>\n    <propina>0.00</propina>\n    <importeTotal>45.80</importeTotal>\n    <moneda>DOLAR</moneda>\n    <pagos>\n      <pago>\n        <formaPago>16</formaPago>\n        <total>45.80</total>\n      </pago>\n    </pagos>\n  </infoFactura>\n  <detalles>\n    <detalle>\n      <codigoPrincipal>BEB-001</codigoPrincipal>\n      <descripcion>Agua Mineral sin Gas 500 mL</descripcion>\n      <cantidad>24.000000</cantidad>\n      <precioUnitario>0.650000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>15.60</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>0</codigoPorcentaje>\n          <tarifa>0.00</tarifa>\n          <baseImponible>15.60</baseImponible>\n          <valor>0.00</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>ALI-003</codigoPrincipal>\n      <descripcion>Atún Lomo en Aceite 170 g</descripcion>\n      <cantidad>12.000000</cantidad>\n      <precioUnitario>1.550000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>18.60</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>0</codigoPorcentaje>\n          <tarifa>0.00</tarifa>\n          <baseImponible>18.60</baseImponible>\n          <valor>0.00</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>ALI-002</codigoPrincipal>\n      <descripcion>Aceite Vegetal de Girasol 1 L</descripcion>\n      <cantidad>4.000000</cantidad>\n      <precioUnitario>2.900000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>11.60</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>0</codigoPorcentaje>\n          <tarifa>0.00</tarifa>\n          <baseImponible>11.60</baseImponible>\n          <valor>0.00</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n  </detalles>\n</factura>\n', 4, '2026-07-15 10:48:00'),
(8, '1', '1', '001', '001', '000000005', '94298626', '2107202601179174582300110010010000000059429862616', '2026-07-21', 6, '04', '1890345671001', 'TECNOSOLUCIONES DEL AUSTRO S.A.', 'Av. Remigio Crespo 4-56 y Guayas, Cuenca', '20', '151.65', '2.55', '22.75', '0.00', '174.40', 'DOLAR', 'GENERADA', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<factura id=\"comprobante\" version=\"1.1.0\">\n  <infoTributaria>\n    <ambiente>1</ambiente>\n    <tipoEmision>1</tipoEmision>\n    <razonSocial>DISTRIBUIDORA COMERCIAL NEXUS S.A.</razonSocial>\n    <nombreComercial>NEXUS Distribuciones</nombreComercial>\n    <ruc>1791745823001</ruc>\n    <claveAcceso>2107202601179174582300110010010000000059429862616</claveAcceso>\n    <codDoc>01</codDoc>\n    <estab>001</estab>\n    <ptoEmi>001</ptoEmi>\n    <secuencial>000000005</secuencial>\n    <dirMatriz>Av. República del Salvador N36-84 y Naciones Unidas, Quito</dirMatriz>\n  </infoTributaria>\n  <infoFactura>\n    <fechaEmision>21/07/2026</fechaEmision>\n    <obligadoContabilidad>SI</obligadoContabilidad>\n    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>\n    <razonSocialComprador>TECNOSOLUCIONES DEL AUSTRO S.A.</razonSocialComprador>\n    <identificacionComprador>1890345671001</identificacionComprador>\n    <direccionComprador>Av. Remigio Crespo 4-56 y Guayas, Cuenca</direccionComprador>\n    <totalSinImpuestos>151.65</totalSinImpuestos>\n    <totalDescuento>2.55</totalDescuento>\n    <totalConImpuestos>\n      <totalImpuesto>\n        <codigo>2</codigo>\n        <codigoPorcentaje>4</codigoPorcentaje>\n        <baseImponible>151.65</baseImponible>\n        <valor>22.75</valor>\n      </totalImpuesto>\n    </totalConImpuestos>\n    <propina>0.00</propina>\n    <importeTotal>174.40</importeTotal>\n    <moneda>DOLAR</moneda>\n    <pagos>\n      <pago>\n        <formaPago>20</formaPago>\n        <total>174.40</total>\n      </pago>\n    </pagos>\n  </infoFactura>\n  <detalles>\n    <detalle>\n      <codigoPrincipal>TEC-002</codigoPrincipal>\n      <descripcion>Teclado Multimedia USB Español</descripcion>\n      <cantidad>8.000000</cantidad>\n      <precioUnitario>12.900000</precioUnitario>\n      <descuento>0.00</descuento>\n      <precioTotalSinImpuesto>103.20</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>103.20</baseImponible>\n          <valor>15.48</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n    <detalle>\n      <codigoPrincipal>TEC-001</codigoPrincipal>\n      <descripcion>Mouse Óptico Inalámbrico USB</descripcion>\n      <cantidad>6.000000</cantidad>\n      <precioUnitario>8.500000</precioUnitario>\n      <descuento>2.55</descuento>\n      <precioTotalSinImpuesto>48.45</precioTotalSinImpuesto>\n      <impuestos>\n        <impuesto>\n          <codigo>2</codigo>\n          <codigoPorcentaje>4</codigoPorcentaje>\n          <tarifa>15.00</tarifa>\n          <baseImponible>48.45</baseImponible>\n          <valor>7.27</valor>\n        </impuesto>\n      </impuestos>\n    </detalle>\n  </detalles>\n</factura>\n', 3, '2026-07-21 10:35:00');

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
  `unidad` varchar(20) DEFAULT NULL,
  `precio_unitario` decimal(12,6) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_total_sin_impuesto` decimal(12,2) NOT NULL,
  `codigo_porcentaje_iva` char(2) NOT NULL,
  `tarifa_iva` decimal(5,2) NOT NULL,
  `base_imponible_iva` decimal(12,2) NOT NULL,
  `valor_iva` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `factura_detalle`
--

INSERT INTO `factura_detalle` (`id_detalle`, `id_factura`, `id_producto`, `codigo_principal`, `descripcion`, `cantidad`, `unidad`, `precio_unitario`, `descuento`, `precio_total_sin_impuesto`, `codigo_porcentaje_iva`, `tarifa_iva`, `base_imponible_iva`, `valor_iva`) VALUES
(5, 4, 15, 'TEC-001', 'Mouse Óptico Inalámbrico USB', '5.000000', 'Und', '8.500000', '0.00', '42.50', '4', '15.00', '42.50', '6.38'),
(6, 4, 17, 'TEC-003', 'Memoria Flash USB 32 GB', '10.000000', 'Und', '6.750000', '3.38', '64.12', '4', '15.00', '64.12', '9.62'),
(7, 5, 6, 'LIMP-001', 'Desinfectante Multiusos Lavanda 1 L', '3.000000', 'L', '2.850000', '0.00', '8.55', '4', '15.00', '8.55', '1.28'),
(8, 5, 10, 'BEB-002', 'Gaseosa Cola 1.5 L', '6.000000', 'Bot', '1.400000', '0.00', '8.40', '4', '15.00', '8.40', '1.26'),
(9, 5, 12, 'ALI-001', 'Arroz Flor Grano Largo 2 Kg', '2.000000', 'Kg', '2.350000', '0.00', '4.70', '0', '0.00', '4.70', '0.00'),
(10, 6, 18, 'PAP-001', 'Resma Papel Bond A4 75 g (500 hojas)', '10.000000', 'Paq', '3.800000', '0.00', '38.00', '4', '15.00', '38.00', '5.70'),
(11, 6, 19, 'PAP-002', 'Esferográfico Punta Fina Azul (caja x12)', '5.000000', 'Caja', '4.200000', '0.00', '21.00', '4', '15.00', '21.00', '3.15'),
(12, 6, 21, 'HOG-001', 'Foco LED 9W Luz Blanca E27', '20.000000', 'Und', '1.750000', '3.50', '31.50', '4', '15.00', '31.50', '4.73'),
(13, 7, 9, 'BEB-001', 'Agua Mineral sin Gas 500 mL', '24.000000', 'Bot', '0.650000', '0.00', '15.60', '0', '0.00', '15.60', '0.00'),
(14, 7, 14, 'ALI-003', 'Atún Lomo en Aceite 170 g', '12.000000', 'Und', '1.550000', '0.00', '18.60', '0', '0.00', '18.60', '0.00'),
(15, 7, 13, 'ALI-002', 'Aceite Vegetal de Girasol 1 L', '4.000000', 'L', '2.900000', '0.00', '11.60', '0', '0.00', '11.60', '0.00'),
(16, 8, 16, 'TEC-002', 'Teclado Multimedia USB Español', '8.000000', 'Und', '12.900000', '0.00', '103.20', '4', '15.00', '103.20', '15.48'),
(17, 8, 15, 'TEC-001', 'Mouse Óptico Inalámbrico USB', '6.000000', 'Und', '8.500000', '2.55', '48.45', '4', '15.00', '48.45', '7.27');

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

INSERT INTO `factura_emisor` (`id_emisor`, `ruc`, `razon_social`, `nombre_comercial`, `dir_matriz`, `ambiente`, `tipo_emision`, `establecimiento`, `punto_emision`, `obligado_contabilidad`, `contribuyente_especial`) VALUES
(1, '1791745823001', 'DISTRIBUIDORA COMERCIAL NEXUS S.A.', 'NEXUS Distribuciones', 'Av. República del Salvador N36-84 y Naciones Unidas, Quito', '1', '1', '001', '001', 'SI', NULL);

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
(12, 'Frame 5', 'fa-chart-bar', '/NRC30713/Proyecto_pw/paginas/frames/frame5.html', 'frame5', 8, 0),
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
(1, 13, 4, 3),
(3, 1, 1, NULL),
(3, 2, 3, NULL),
(3, 3, 4, NULL),
(3, 4, 5, NULL),
(3, 5, 3, 5),
(3, 6, 2, 5),
(3, 7, 1, 5),
(3, 8, 6, NULL),
(3, 9, 7, NULL),
(3, 10, 8, NULL),
(3, 11, 9, NULL),
(4, 1, 1, NULL),
(4, 5, 3, 6),
(4, 6, 2, 6),
(4, 7, 1, 6),
(4, 9, 3, NULL),
(4, 10, 4, NULL),
(4, 11, 5, NULL),
(5, 1, 1, NULL),
(5, 5, 3, 7),
(5, 6, 2, 7),
(5, 7, 1, 7),
(5, 8, 3, NULL),
(5, 9, 4, NULL),
(5, 11, 5, NULL),
(6, 1, 1, NULL),
(6, 5, 3, 8),
(6, 6, 2, 8),
(6, 7, 1, 8),
(6, 8, 3, NULL),
(6, 9, 4, NULL),
(6, 10, 5, NULL),
(6, 11, 6, NULL);

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
(3, 1, 'Administración', 102, 0),
(5, 3, 'Mi Perfil', 2, 1),
(6, 4, 'Mi Perfil', 2, 1),
(7, 5, 'Mi Perfil', 2, 1),
(8, 6, 'Mi Perfil', 2, 1);

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
(146, 1, 'frame2', 'crear'),
(147, 1, 'frame2', 'editar'),
(27, 1, 'frame2', 'leer'),
(161, 1, 'frame3', 'crear'),
(162, 1, 'frame3', 'editar'),
(164, 1, 'frame3', 'eliminar'),
(163, 1, 'frame3', 'estado'),
(28, 1, 'frame3', 'leer'),
(165, 1, 'frame4', 'crear'),
(166, 1, 'frame4', 'editar'),
(168, 1, 'frame4', 'eliminar'),
(167, 1, 'frame4', 'estado'),
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
(169, 2, 'dashboard', 'leer'),
(177, 2, 'frame1', 'leer'),
(179, 2, 'frame2', 'crear'),
(178, 2, 'frame2', 'leer'),
(180, 2, 'frame3', 'leer'),
(181, 2, 'frame4', 'leer'),
(171, 2, 'menu', 'crear'),
(173, 2, 'menu', 'eliminar'),
(170, 2, 'menu', 'leer'),
(172, 2, 'menu', 'renombrar'),
(174, 2, 'menu', 'reordenar'),
(176, 2, 'perfil', 'editar'),
(175, 2, 'perfil', 'leer'),
(182, 3, 'dashboard', 'leer'),
(190, 3, 'frame1', 'leer'),
(192, 3, 'frame2', 'crear'),
(193, 3, 'frame2', 'editar'),
(191, 3, 'frame2', 'leer'),
(195, 3, 'frame3', 'crear'),
(196, 3, 'frame3', 'editar'),
(198, 3, 'frame3', 'eliminar'),
(197, 3, 'frame3', 'estado'),
(194, 3, 'frame3', 'leer'),
(200, 3, 'frame4', 'crear'),
(201, 3, 'frame4', 'editar'),
(203, 3, 'frame4', 'eliminar'),
(202, 3, 'frame4', 'estado'),
(199, 3, 'frame4', 'leer'),
(186, 3, 'menu', 'crear'),
(188, 3, 'menu', 'eliminar'),
(185, 3, 'menu', 'leer'),
(187, 3, 'menu', 'renombrar'),
(189, 3, 'menu', 'reordenar'),
(184, 3, 'perfil', 'editar'),
(183, 3, 'perfil', 'leer'),
(214, 3, 'permisos', 'crear'),
(213, 3, 'permisos', 'leer'),
(210, 3, 'roles', 'crear'),
(211, 3, 'roles', 'editar'),
(212, 3, 'roles', 'eliminar'),
(209, 3, 'roles', 'leer'),
(208, 3, 'usuarios', 'cambiar_rol'),
(205, 3, 'usuarios', 'crear'),
(207, 3, 'usuarios', 'desactivar'),
(206, 3, 'usuarios', 'editar'),
(204, 3, 'usuarios', 'leer'),
(215, 4, 'dashboard', 'leer'),
(224, 4, 'frame2', 'crear'),
(223, 4, 'frame2', 'leer'),
(225, 4, 'frame3', 'leer'),
(226, 4, 'frame4', 'leer'),
(219, 4, 'menu', 'crear'),
(221, 4, 'menu', 'eliminar'),
(218, 4, 'menu', 'leer'),
(220, 4, 'menu', 'renombrar'),
(222, 4, 'menu', 'reordenar'),
(217, 4, 'perfil', 'editar'),
(216, 4, 'perfil', 'leer'),
(227, 5, 'dashboard', 'leer'),
(235, 5, 'frame1', 'leer'),
(236, 5, 'frame2', 'leer'),
(237, 5, 'frame4', 'leer'),
(231, 5, 'menu', 'crear'),
(233, 5, 'menu', 'eliminar'),
(230, 5, 'menu', 'leer'),
(232, 5, 'menu', 'renombrar'),
(234, 5, 'menu', 'reordenar'),
(229, 5, 'perfil', 'editar'),
(228, 5, 'perfil', 'leer'),
(238, 6, 'dashboard', 'leer'),
(246, 6, 'frame1', 'leer'),
(247, 6, 'frame2', 'leer'),
(248, 6, 'frame3', 'leer'),
(249, 6, 'frame4', 'leer'),
(242, 6, 'menu', 'crear'),
(244, 6, 'menu', 'eliminar'),
(241, 6, 'menu', 'leer'),
(243, 6, 'menu', 'renombrar'),
(245, 6, 'menu', 'reordenar'),
(240, 6, 'perfil', 'editar'),
(239, 6, 'perfil', 'leer');

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
  `id_unidad` int(11) NOT NULL DEFAULT '7',
  `stock` decimal(12,6) NOT NULL DEFAULT '0.000000',
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activo 0=inactivo',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `codigo_principal`, `descripcion`, `precio_unitario`, `codigo_porcentaje_iva`, `id_categoria`, `id_unidad`, `stock`, `estado`, `created_by`, `created_at`) VALUES
(6, 'LIMP-001', 'Desinfectante Multiusos Lavanda 1 L', '2.850000', '4', 1, 5, '137.000000', 1, 1, '2026-07-23 17:48:40'),
(7, 'LIMP-002', 'Detergente en Polvo Multiusos 5 Kg', '8.900000', '4', 1, 1, '80.000000', 1, 1, '2026-07-23 17:48:40'),
(8, 'LIMP-003', 'Jabón Líquido Antibacterial 500 mL', '1.950000', '4', 1, 6, '210.000000', 1, 1, '2026-07-23 17:48:40'),
(9, 'BEB-001', 'Agua Mineral sin Gas 500 mL', '0.650000', '0', 3, 10, '456.000000', 1, 1, '2026-07-23 17:48:40'),
(10, 'BEB-002', 'Gaseosa Cola 1.5 L', '1.400000', '4', 3, 10, '294.000000', 1, 1, '2026-07-23 17:48:40'),
(11, 'BEB-003', 'Café Molido Tostado 500 g', '4.750000', '4', 3, 8, '95.000000', 1, 1, '2026-07-23 17:48:40'),
(12, 'ALI-001', 'Arroz Flor Grano Largo 2 Kg', '2.350000', '0', 2, 1, '158.000000', 1, 1, '2026-07-23 17:48:40'),
(13, 'ALI-002', 'Aceite Vegetal de Girasol 1 L', '2.900000', '0', 2, 5, '116.000000', 1, 1, '2026-07-23 17:48:40'),
(14, 'ALI-003', 'Atún Lomo en Aceite 170 g', '1.550000', '0', 2, 7, '248.000000', 1, 1, '2026-07-23 17:48:40'),
(15, 'TEC-001', 'Mouse Óptico Inalámbrico USB', '8.500000', '4', 4, 7, '44.000000', 1, 1, '2026-07-23 17:48:40'),
(16, 'TEC-002', 'Teclado Multimedia USB Español', '12.900000', '4', 4, 7, '30.000000', 1, 1, '2026-07-23 17:48:40'),
(17, 'TEC-003', 'Memoria Flash USB 32 GB', '6.750000', '4', 4, 7, '80.000000', 1, 1, '2026-07-23 17:48:40'),
(18, 'PAP-001', 'Resma Papel Bond A4 75 g (500 hojas)', '3.800000', '4', 5, 8, '210.000000', 1, 1, '2026-07-23 17:48:40'),
(19, 'PAP-002', 'Esferográfico Punta Fina Azul (caja x12)', '4.200000', '4', 5, 9, '65.000000', 1, 1, '2026-07-23 17:48:40'),
(20, 'PAP-003', 'Cuaderno Universitario 100 Hojas', '1.850000', '4', 5, 7, '150.000000', 1, 1, '2026-07-23 17:48:40'),
(21, 'HOG-001', 'Foco LED 9W Luz Blanca E27', '1.750000', '4', 6, 7, '180.000000', 1, 1, '2026-07-23 17:48:40');

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
(1, 'admin', '$2y$12$IZPwpujfByoJVcrm2Vjt4ur5YNfgZGvce1Hj6x8kpzz3JHOc7dIqG', 'Administrador del Sistema', 'admin@empresa.local', 1, 1, 0, NULL, '2026-06-30 08:29:35'),
(3, 'rmora', '$2y$12$4l3twfqNEPuhJrwSfNnZneyV7aMnSKTrnHM8j2IbgjWXHEnmdwGh.', 'Ricardo Andrés Mora Villavicencio', 'ricardo.mora@nexusdist.ec', 3, 1, 0, 1, '2026-07-23 17:48:40'),
(4, 'gsalazar', '$2y$12$4l3twfqNEPuhJrwSfNnZneyV7aMnSKTrnHM8j2IbgjWXHEnmdwGh.', 'Gabriela Estefanía Salazar Ponce', 'gabriela.salazar@nexusdist.ec', 4, 1, 0, 1, '2026-07-23 17:48:40'),
(5, 'lnaranjo', '$2y$12$4l3twfqNEPuhJrwSfNnZneyV7aMnSKTrnHM8j2IbgjWXHEnmdwGh.', 'Luis Fernando Naranjo Espín', 'luis.naranjo@nexusdist.ec', 5, 1, 0, 1, '2026-07-23 17:48:40'),
(6, 'pjimenez', '$2y$12$4l3twfqNEPuhJrwSfNnZneyV7aMnSKTrnHM8j2IbgjWXHEnmdwGh.', 'Paola Cristina Jiménez Andrade', 'paola.jimenez@nexusdist.ec', 6, 1, 0, 1, '2026-07-23 17:48:40');

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
(1, 'Admin', 'Administrador del sistema. No eliminar.', 1),
(2, 'Vendedor', 'Vende Productos del Inventario', 1),
(3, 'Supervisor', 'Supervisión general: facturación, inventario, clientes y administración de usuarios y roles.', 1),
(4, 'Facturador', 'Emisión y consulta de facturas; consulta de clientes e inventario. Sin permisos administrativos.', 1),
(5, 'Auxiliar de Cobranza', 'Consulta de facturas, clientes y estados de pago para la gestión de cobranza. Sin acceso a inventario ni configuración.', 1),
(6, 'Analista de Facturación', 'Consulta de facturas, movimientos e inventario para análisis y reportes. Solo lectura, sin modificaciones administrativas.', 1);

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

--
-- Volcado de datos para la tabla `sesiones`
--

INSERT INTO `sesiones` (`token`, `id_user`, `ip`, `expires_at`, `created_at`) VALUES
('e21f5f12c3d0cc9daeb05f5a6f167cacb2f84ccbb36f862cf5242590edf5f766', 1, '::1', '2026-07-24 16:46:56', '2026-07-24 10:46:56');

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_movimientos`
--

CREATE TABLE `inventario_movimientos` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) DEFAULT NULL,
  `codigo_principal` varchar(25) NOT NULL COMMENT 'instantánea: sobrevive al borrado del producto',
  `descripcion` varchar(300) NOT NULL COMMENT 'instantánea',
  `unidad` varchar(20) DEFAULT NULL COMMENT 'instantánea',
  `tipo` varchar(30) NOT NULL COMMENT 'INGRESO POR COMPRA | AJUSTE DE INVENTARIO',
  `cantidad` decimal(12,6) NOT NULL COMMENT 'magnitud del cambio (siempre positiva)',
  `stock_anterior` decimal(12,6) NOT NULL,
  `stock_nuevo` decimal(12,6) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_invmov_producto` (`id_producto`),
  KEY `fk_invmov_user` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `inventario_movimientos`
--

INSERT INTO `inventario_movimientos` (`id_movimiento`, `id_producto`, `codigo_principal`, `descripcion`, `unidad`, `tipo`, `cantidad`, `stock_anterior`, `stock_nuevo`, `created_by`, `created_at`) VALUES
(1, 6, 'LIMP-001', 'Desinfectante Multiusos Lavanda 1 L', 'L', 'INGRESO POR COMPRA', '140.000000', '0.000000', '140.000000', 1, '2026-06-24 10:55:00'),
(2, 7, 'LIMP-002', 'Detergente en Polvo Multiusos 5 Kg', 'Kg', 'INGRESO POR COMPRA', '80.000000', '0.000000', '80.000000', 1, '2026-07-23 17:48:40'),
(3, 8, 'LIMP-003', 'Jabón Líquido Antibacterial 500 mL', 'mL', 'INGRESO POR COMPRA', '210.000000', '0.000000', '210.000000', 1, '2026-07-23 17:48:40'),
(4, 9, 'BEB-001', 'Agua Mineral sin Gas 500 mL', 'Bot', 'INGRESO POR COMPRA', '480.000000', '0.000000', '480.000000', 1, '2026-07-14 10:48:00'),
(5, 10, 'BEB-002', 'Gaseosa Cola 1.5 L', 'Bot', 'INGRESO POR COMPRA', '300.000000', '0.000000', '300.000000', 1, '2026-06-24 10:55:00'),
(6, 11, 'BEB-003', 'Café Molido Tostado 500 g', 'Paq', 'INGRESO POR COMPRA', '95.000000', '0.000000', '95.000000', 1, '2026-07-23 17:48:40'),
(7, 12, 'ALI-001', 'Arroz Flor Grano Largo 2 Kg', 'Kg', 'INGRESO POR COMPRA', '160.000000', '0.000000', '160.000000', 1, '2026-06-24 10:55:00'),
(8, 13, 'ALI-002', 'Aceite Vegetal de Girasol 1 L', 'L', 'INGRESO POR COMPRA', '120.000000', '0.000000', '120.000000', 1, '2026-07-14 10:48:00'),
(9, 14, 'ALI-003', 'Atún Lomo en Aceite 170 g', 'Und', 'INGRESO POR COMPRA', '260.000000', '0.000000', '260.000000', 1, '2026-07-14 10:48:00'),
(10, 15, 'TEC-001', 'Mouse Óptico Inalámbrico USB', 'Und', 'INGRESO POR COMPRA', '55.000000', '0.000000', '55.000000', 1, '2026-06-11 10:30:00'),
(11, 16, 'TEC-002', 'Teclado Multimedia USB Español', 'Und', 'INGRESO POR COMPRA', '38.000000', '0.000000', '38.000000', 1, '2026-07-20 10:35:00'),
(12, 17, 'TEC-003', 'Memoria Flash USB 32 GB', 'Und', 'INGRESO POR COMPRA', '90.000000', '0.000000', '90.000000', 1, '2026-06-11 10:30:00'),
(13, 18, 'PAP-001', 'Resma Papel Bond A4 75 g (500 hojas)', 'Paq', 'INGRESO POR COMPRA', '220.000000', '0.000000', '220.000000', 1, '2026-07-02 10:26:00'),
(14, 19, 'PAP-002', 'Esferográfico Punta Fina Azul (caja x12)', 'Caja', 'INGRESO POR COMPRA', '70.000000', '0.000000', '70.000000', 1, '2026-07-02 10:26:00'),
(15, 20, 'PAP-003', 'Cuaderno Universitario 100 Hojas', 'Und', 'INGRESO POR COMPRA', '150.000000', '0.000000', '150.000000', 1, '2026-07-23 17:48:40'),
(16, 21, 'HOG-001', 'Foco LED 9W Luz Blanca E27', 'Und', 'INGRESO POR COMPRA', '200.000000', '0.000000', '200.000000', 1, '2026-07-02 10:26:00');


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades_medida`
--

CREATE TABLE `unidades_medida` (
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `abreviatura` varchar(20) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activa 0=inactiva'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `unidades_medida`
--

INSERT INTO `unidades_medida` (`id_unidad`, `nombre`, `abreviatura`, `estado`) VALUES
(1, 'Kilogramos', 'Kg', 1),
(2, 'Gramos', 'g', 1),
(3, 'Onzas', 'oz', 1),
(4, 'Libras', 'lb', 1),
(5, 'Litros', 'L', 1),
(6, 'Mililitros', 'mL', 1),
(7, 'Unidades', 'Und', 1),
(8, 'Paquetes', 'Paq', 1),
(9, 'Cajas', 'Caja', 1),
(10, 'Botellas', 'Bot', 1);

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
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `uk_categoria_nombre` (`nombre`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `uk_cliente_identificacion` (`tipo_identificacion`,`identificacion`),
  ADD KEY `fk_cliente_user` (`created_by`);

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
  ADD KEY `fk_producto_user` (`created_by`),
  ADD KEY `fk_producto_categoria` (`id_categoria`),
  ADD KEY `fk_producto_unidad` (`id_unidad`);

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
-- Indices de la tabla `unidades_medida`
--
ALTER TABLE `unidades_medida`
  ADD PRIMARY KEY (`id_unidad`),
  ADD UNIQUE KEY `uk_unidad_nombre` (`nombre`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `factura_emisor`
--
ALTER TABLE `factura_emisor`
  MODIFY `id_emisor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id_super` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `permisos_rol`
--
ALTER TABLE `permisos_rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=250;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `pw_user`
--
ALTER TABLE `pw_user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id_tarea` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `unidades_medida`
--
ALTER TABLE `unidades_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_factura_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_factura_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  ADD CONSTRAINT `fk_detalle_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Filtros para la tabla `inventario_movimientos`
--
ALTER TABLE `inventario_movimientos`
  ADD CONSTRAINT `fk_invmov_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invmov_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
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
