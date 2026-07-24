<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/facturacion/lib/Catalogos.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame1', 'leer');

$db = getDB();

// ------------------------------------------------------------
// Comprobantes electrónicos emitidos (Tabla 3 de la Ficha
// Técnica SRI v2.32). Cada tipo que el sistema emita se agrega
// a esta consulta con su codDoc; los tipos aún no implementados
// (03, 04, 05, 06, 07) se incorporarán aquí cuando exista su
// módulo, sin cambios en el cliente.
// ------------------------------------------------------------
$comprobantes = $db->query("
    SELECT '01' AS cod_doc,
           f.id_factura AS id_origen,
           CONCAT(f.establecimiento, '-', f.punto_emision, '-', f.secuencial) AS documento,
           f.clave_acceso,
           f.fecha_emision,
           f.razon_social_comprador   AS receptor,
           f.identificacion_comprador AS identificacion_receptor,
           f.importe_total,
           f.estado,
           f.ambiente,
           f.created_at,
           u.nombre AS registrado_por
    FROM   facturas f
    LEFT   JOIN pw_user u ON u.id_user = f.created_by
    ORDER  BY f.created_at DESC, f.id_factura DESC
")->fetchAll();

foreach ($comprobantes as &$c) {
    $c['tipo'] = Catalogos::TIPO_COMPROBANTE[$c['cod_doc']] ?? 'DESCONOCIDO';
}
unset($c);

// ------------------------------------------------------------
// Movimientos de inventario. Se combinan dos orígenes:
//   * Salidas por venta, derivadas del detalle de las facturas
//     (no se duplican en una tabla propia).
//   * Ingresos y ajustes registrados al crear o editar un
//     producto, almacenados en inventario_movimientos.
// ------------------------------------------------------------
$inventario = $db->query("
    SELECT * FROM (
        SELECT d.codigo_principal,
               d.descripcion,
               d.cantidad,
               d.unidad,
               NULL AS proveedor,
               'SALIDA POR VENTA' AS tipo_movimiento,
               CONCAT(f.establecimiento, '-', f.punto_emision, '-', f.secuencial) AS documento,
               f.fecha_emision,
               f.created_at,
               u.nombre AS registrado_por
        FROM   factura_detalle d
        INNER  JOIN facturas f ON f.id_factura = d.id_factura
        LEFT   JOIN pw_user u ON u.id_user = f.created_by

        UNION ALL

        SELECT m.codigo_principal,
               m.descripcion,
               m.cantidad,
               m.unidad,
               m.proveedor,
               m.tipo AS tipo_movimiento,
               '—' AS documento,
               DATE(m.created_at) AS fecha_emision,
               m.created_at,
               u.nombre AS registrado_por
        FROM   inventario_movimientos m
        LEFT   JOIN pw_user u ON u.id_user = m.created_by
    ) AS movimientos
    ORDER BY created_at DESC, codigo_principal ASC
")->fetchAll();

responder(true, 'OK', [
    'tipos'        => Catalogos::TIPO_COMPROBANTE,
    'comprobantes' => $comprobantes,
    'inventario'   => $inventario,
]);
