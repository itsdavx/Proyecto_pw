<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame2', 'leer');

$idFactura = (int)($input['id_factura'] ?? 0);
if (!$idFactura) responder(false, 'ID de factura requerido.');

$db = getDB();

$factura = $db->prepare("SELECT * FROM facturas WHERE id_factura = ?");
$factura->execute([$idFactura]);
$factura = $factura->fetch();
if (!$factura) responder(false, 'Factura no encontrada.');

$detalle = $db->prepare("SELECT * FROM factura_detalle WHERE id_factura = ? ORDER BY id_detalle ASC");
$detalle->execute([$idFactura]);

responder(true, 'OK', ['factura' => $factura, 'detalle' => $detalle->fetchAll()]);
