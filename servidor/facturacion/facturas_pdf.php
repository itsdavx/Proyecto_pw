<?php
require_once dirname(__DIR__) . '/config.php';
require_once __DIR__ . '/lib/Catalogos.php';
require_once __DIR__ . '/lib/RidePdf.php';

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
$detalle = $detalle->fetchAll();

// Datos vigentes del emisor
$emisor = $db->query("SELECT * FROM factura_emisor WHERE id_emisor = 1")->fetch();
if (!$emisor) responder(false, 'No están configurados los datos del emisor.');

$pdf = RidePdf::factura($emisor, $factura, $detalle);

// PDF viene en base64
responder(true, 'OK', [
    'pdf_base64'   => base64_encode($pdf),
    'clave_acceso' => $factura['clave_acceso'],
]);
