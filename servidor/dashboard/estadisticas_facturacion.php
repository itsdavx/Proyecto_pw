<?php
// Conteos de facturación
require_once dirname(__DIR__) . '/config.php';

const UMBRAL_STOCK_BAJO = 10;

$input = getInput();
$token = $input['token'] ?? '';
verificarSesion($token);

$db = getDB();

$f = $db->query("
    SELECT COUNT(*) AS total,
           COALESCE(SUM(fecha_emision = CURDATE()), 0) AS hoy,
           COALESCE(SUM(YEAR(fecha_emision) = YEAR(CURDATE()) AND MONTH(fecha_emision) = MONTH(CURDATE())), 0) AS mes,
           COALESCE(SUM(importe_total), 0) AS monto_total
    FROM facturas
")->fetch();

$p = $db->query("
    SELECT COUNT(*) AS total,
           COALESCE(SUM(estado = 1 AND stock <= " . UMBRAL_STOCK_BAJO . "), 0) AS stock_bajo,
           COALESCE(SUM(CASE WHEN estado = 1 THEN stock * precio_unitario ELSE 0 END), 0) AS valor_inventario
    FROM productos
")->fetch();

$clientes = (int)$db->query("SELECT COUNT(*) FROM clientes")->fetchColumn();

$detalle  = (int)$db->query("SELECT COUNT(*) FROM factura_detalle")->fetchColumn();
$ingresos = (int)$db->query("SELECT COUNT(*) FROM inventario_movimientos")->fetchColumn();

responder(true, 'OK', [
    'facturas_total'    => (int)$f['total'],
    'facturas_hoy'      => (int)$f['hoy'],
    'facturas_mes'      => (int)$f['mes'],
    'monto_facturado'   => round((float)$f['monto_total'], 2),
    'clientes'          => $clientes,
    'productos'         => (int)$p['total'],
    'movimientos'       => (int)$f['total'] + $detalle + $ingresos,
    'stock_bajo'        => (int)$p['stock_bajo'],
    'valor_inventario'  => round((float)$p['valor_inventario'], 2),
    'umbral_stock_bajo' => UMBRAL_STOCK_BAJO,
]);
