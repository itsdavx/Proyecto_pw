<?php
/**
 * Estadísticas del Módulo de Facturación para el Dashboard.
 *
 * Información de solo consulta, disponible para cualquier usuario
 * autenticado (no depende del rol). Se calcula con consultas
 * agregadas — cuatro en total, una por tabla — para no repetir
 * conteos ni recorrer filas en el cliente.
 */
require_once dirname(__DIR__) . '/config.php';

// Umbral de "stock bajo": productos activos con existencia en o por
// debajo de este valor. Centralizado aquí para ajustarlo en un solo sitio.
const UMBRAL_STOCK_BAJO = 10;

$input = getInput();
$token = $input['token'] ?? '';
verificarSesion($token);

$db = getDB();

// Facturas: total, del día y del mes en una sola pasada.
$f = $db->query("
    SELECT COUNT(*) AS total,
           COALESCE(SUM(fecha_emision = CURDATE()), 0) AS hoy,
           COALESCE(SUM(YEAR(fecha_emision) = YEAR(CURDATE()) AND MONTH(fecha_emision) = MONTH(CURDATE())), 0) AS mes,
           COALESCE(SUM(importe_total), 0) AS monto_total
    FROM facturas
")->fetch();

// Productos: total, con stock bajo y valor del inventario (solo activos).
$p = $db->query("
    SELECT COUNT(*) AS total,
           COALESCE(SUM(estado = 1 AND stock <= " . UMBRAL_STOCK_BAJO . "), 0) AS stock_bajo,
           COALESCE(SUM(CASE WHEN estado = 1 THEN stock * precio_unitario ELSE 0 END), 0) AS valor_inventario
    FROM productos
")->fetch();

$clientes = (int)$db->query("SELECT COUNT(*) FROM clientes")->fetchColumn();

// Movimientos = comprobantes emitidos (facturas) + salidas de inventario
// (líneas de detalle), tal como los presenta el módulo Movimientos.
$detalle = (int)$db->query("SELECT COUNT(*) FROM factura_detalle")->fetchColumn();

responder(true, 'OK', [
    'facturas_total'    => (int)$f['total'],
    'facturas_hoy'      => (int)$f['hoy'],
    'facturas_mes'      => (int)$f['mes'],
    'monto_facturado'   => round((float)$f['monto_total'], 2),
    'clientes'          => $clientes,
    'productos'         => (int)$p['total'],
    'movimientos'       => (int)$f['total'] + $detalle,
    'stock_bajo'        => (int)$p['stock_bajo'],
    'valor_inventario'  => round((float)$p['valor_inventario'], 2),
    'umbral_stock_bajo' => UMBRAL_STOCK_BAJO,
]);
