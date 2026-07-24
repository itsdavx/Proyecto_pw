-- =====================================================================
-- Migración — Ingresos de inventario
-- Registra los movimientos de inventario que NO provienen de una venta:
-- el stock inicial al crear un producto y los cambios de existencia al
-- editarlo. Las salidas se siguen derivando del detalle de facturas
-- (factura_detalle), por lo que no se duplica esa información.
-- No modifica ni elimina ninguna tabla existente. Ejecutar una sola vez
-- sobre la BD ya desplegada (instalación nueva: usar proyecto_pw.sql).
-- =====================================================================

SET AUTOCOMMIT = 0;
START TRANSACTION;

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

ALTER TABLE `inventario_movimientos`
  ADD CONSTRAINT `fk_invmov_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invmov_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Ingreso inicial de los productos ya existentes, para que el historial
-- quede completo y cuadrado desde el primer día. La cantidad reconstruye
-- la existencia original (stock actual + lo ya vendido), de modo que
-- se cumpla: ingreso - salidas = stock actual. La fecha se sitúa un día
-- antes de la primera venta del producto, preservando la cronología.
INSERT INTO `inventario_movimientos`
    (`id_producto`, `codigo_principal`, `descripcion`, `unidad`, `tipo`, `cantidad`, `stock_anterior`, `stock_nuevo`, `created_by`, `created_at`)
SELECT p.id_producto, p.codigo_principal, p.descripcion, u.abreviatura, 'INGRESO POR COMPRA',
       p.stock + COALESCE((SELECT SUM(d.cantidad) FROM factura_detalle d WHERE d.id_producto = p.id_producto), 0),
       0,
       p.stock + COALESCE((SELECT SUM(d.cantidad) FROM factura_detalle d WHERE d.id_producto = p.id_producto), 0),
       p.created_by,
       IFNULL((SELECT DATE_SUB(MIN(f.created_at), INTERVAL 1 DAY)
               FROM   factura_detalle d
               INNER  JOIN facturas f ON f.id_factura = d.id_factura
               WHERE  d.id_producto = p.id_producto), p.created_at)
FROM   productos p
INNER  JOIN unidades_medida u ON u.id_unidad = p.id_unidad
WHERE  p.stock + COALESCE((SELECT SUM(d.cantidad) FROM factura_detalle d WHERE d.id_producto = p.id_producto), 0) > 0;

COMMIT;
