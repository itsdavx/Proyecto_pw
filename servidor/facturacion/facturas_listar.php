<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame2', 'leer');

$db   = getDB();
$stmt = $db->prepare("
    SELECT id_factura, establecimiento, punto_emision, secuencial, clave_acceso, fecha_emision,
           razon_social_comprador, identificacion_comprador,
           total_sin_impuestos, total_iva, importe_total, estado
    FROM   facturas
    ORDER  BY id_factura DESC
");
$stmt->execute();

responder(true, 'OK', $stmt->fetchAll());
