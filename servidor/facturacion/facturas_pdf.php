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

// La factura conserva sus datos de emisión (serie, ambiente, totales);
// del emisor se toman los datos descriptivos vigentes (razón social,
// dirección), igual que hizo el XML al generarse.
$emisor = $db->query("SELECT * FROM factura_emisor WHERE id_emisor = 1")->fetch();
if (!$emisor) responder(false, 'No están configurados los datos del emisor.');

$pdf = RidePdf::factura($emisor, $factura, $detalle);

// PDF en base64 dentro del JSON, siguiendo el mismo patrón de
// respuesta y descarga que el resto de endpoints del módulo.
responder(true, 'OK', [
    'pdf_base64'   => base64_encode($pdf),
    'clave_acceso' => $factura['clave_acceso'],
]);
