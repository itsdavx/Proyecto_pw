<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame2', 'editar');

$ruc             = trim($input['ruc'] ?? '');
$razonSocial     = trim($input['razon_social'] ?? '');
$nombreComercial = trim($input['nombre_comercial'] ?? '');
$dirMatriz       = trim($input['dir_matriz'] ?? '');
$ambiente        = trim($input['ambiente'] ?? '1');
$tipoEmision     = trim($input['tipo_emision'] ?? '1');
$establecimiento = trim($input['establecimiento'] ?? '001');
$puntoEmision    = trim($input['punto_emision'] ?? '001');
$obligado        = trim($input['obligado_contabilidad'] ?? 'NO');
$contribuyente   = trim($input['contribuyente_especial'] ?? '');

if (!preg_match('/^\d{13}$/', $ruc))            responder(false, 'El RUC del emisor debe tener 13 dígitos.');
if ($razonSocial === '')                        responder(false, 'La razón social del emisor es obligatoria.');
if ($dirMatriz === '')                           responder(false, 'La dirección matriz es obligatoria.');
if (!in_array($ambiente, ['1', '2'], true))       responder(false, 'Ambiente inválido.');
if (!in_array($obligado, ['SI', 'NO'], true))     responder(false, 'Obligado a llevar contabilidad inválido.');
if (!preg_match('/^\d{3}$/', $establecimiento))  responder(false, 'El establecimiento debe tener 3 dígitos.');
if (!preg_match('/^\d{3}$/', $puntoEmision))     responder(false, 'El punto de emisión debe tener 3 dígitos.');

$db     = getDB();
$existe = $db->query("SELECT id_emisor FROM factura_emisor WHERE id_emisor = 1")->fetch();

$params = [
    $ruc, $razonSocial, $nombreComercial !== '' ? $nombreComercial : null, $dirMatriz, $ambiente, $tipoEmision,
    $establecimiento, $puntoEmision, $obligado, $contribuyente !== '' ? $contribuyente : null,
];

if ($existe) {
    $db->prepare("
        UPDATE factura_emisor
        SET    ruc = ?, razon_social = ?, nombre_comercial = ?, dir_matriz = ?, ambiente = ?, tipo_emision = ?,
               establecimiento = ?, punto_emision = ?, obligado_contabilidad = ?, contribuyente_especial = ?
        WHERE  id_emisor = 1
    ")->execute($params);
} else {
    $db->prepare("
        INSERT INTO factura_emisor
            (id_emisor, ruc, razon_social, nombre_comercial, dir_matriz, ambiente, tipo_emision, establecimiento, punto_emision, obligado_contabilidad, contribuyente_especial)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ")->execute($params);
}

responder(true, 'Datos del emisor guardados correctamente.');
