-- =====================================================================
-- Migración — Inventario: categorías, unidades de medida y stock.
-- Agrega los catálogos de categorías y unidades, los asocia a los
-- productos (que ahora llevan stock), y guarda la unidad como
-- instantánea en el detalle de factura. Registra además la acción
-- RBAC frame2/eliminar (eliminar clientes y productos) y renombra
-- el Frame 3 como "Inventario". No elimina ninguna tabla existente.
-- Ejecutar una sola vez sobre la BD ya desplegada (para instalación
-- nueva usar directamente database/proyecto_pw.sql).
-- =====================================================================

SET AUTOCOMMIT = 0;
START TRANSACTION;

-- ---------------------------------------------------------------------
-- Catálogo de categorías de producto
-- ---------------------------------------------------------------------
CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activa 0=inactiva',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uk_categoria_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Limpieza'),
(2, 'Comida'),
(3, 'Bebidas'),
(4, 'Tecnología'),
(5, 'Papelería'),
(6, 'Hogar'),
(7, 'Salud'),
(8, 'Otros');

-- ---------------------------------------------------------------------
-- Catálogo de unidades de medida
-- ---------------------------------------------------------------------
CREATE TABLE `unidades_medida` (
  `id_unidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `abreviatura` varchar(20) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=activa 0=inactiva',
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `uk_unidad_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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

-- ---------------------------------------------------------------------
-- Productos: categoría, unidad de medida (por defecto: Unidades) y
-- stock disponible. Los productos existentes quedan en stock 0 hasta
-- que se les asigne existencia desde el formulario de producto.
-- ---------------------------------------------------------------------
ALTER TABLE `productos`
  ADD `id_categoria` int(11) DEFAULT NULL AFTER `codigo_porcentaje_iva`,
  ADD `id_unidad` int(11) NOT NULL DEFAULT '7' AFTER `id_categoria`,
  ADD `stock` decimal(12,6) NOT NULL DEFAULT '0.000000' AFTER `id_unidad`,
  ADD KEY `fk_producto_categoria` (`id_categoria`),
  ADD KEY `fk_producto_unidad` (`id_unidad`);

ALTER TABLE `productos`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_producto_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_medida` (`id_unidad`) ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- Detalle de factura: instantánea de la unidad al momento de emitir
-- (sobrevive a la eliminación del producto, igual que código y
-- descripción). Se rellena el histórico con la unidad actual.
-- ---------------------------------------------------------------------
ALTER TABLE `factura_detalle`
  ADD `unidad` varchar(20) DEFAULT NULL AFTER `cantidad`;

UPDATE `factura_detalle` d
  JOIN `productos` p        ON p.id_producto = d.id_producto
  JOIN `unidades_medida` u  ON u.id_unidad   = p.id_unidad
  SET  d.unidad = u.abreviatura
  WHERE d.unidad IS NULL;

-- ---------------------------------------------------------------------
-- RBAC: nueva acción frame2/eliminar (eliminar clientes y productos).
-- El Administrador la recibe explícitamente por consistencia con el
-- resto del catálogo (el sistema ya lo exime de la verificación).
-- ---------------------------------------------------------------------
INSERT INTO `permisos_rol` (`id_rol`, `modulo`, `accion`) VALUES
(1, 'frame2', 'eliminar');

-- Renombrar el Frame 3 como Inventario, con icono propio
-- (mismo id_menu, misma url — no se registra un módulo nuevo).
UPDATE `menu` SET `nombre` = 'Inventario', `icono` = 'fa-box' WHERE `modulo` = 'frame3';

COMMIT;
