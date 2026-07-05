<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'crear');

$nombre   = trim($input['nombre']   ?? '');
$icono    = trim($input['icono']    ?? '');
$url      = trim($input['url']      ?? '');
$modulo   = trim($input['modulo']   ?? '');
$orden    = (int)($input['orden']   ?? 0);
$estado   = isset($input['estado']) ? (int)$input['estado'] : 1;
// padre_id: null si no se envía o si viene como null/vacío
$padre_id = !empty($input['padre_id']) ? (int)$input['padre_id'] : null;

if (empty($nombre)) {
    responder(false, 'El nombre del item de menu es obligatorio.');
}

$db   = getDB();
$stmt = $db->prepare("
    INSERT INTO menu (nombre, icono, url, padre_id, modulo, orden, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([
    $nombre,
    $icono  ?: null,
    $url    ?: null,
    $padre_id,
    $modulo ?: null,
    $orden,
    $estado ? 1 : 0,
]);

responder(true, 'Item de menu creado.', ['id_menu' => (int)$db->lastInsertId()]);
