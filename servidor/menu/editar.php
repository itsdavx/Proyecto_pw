<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'editar');

$id_menu  = (int)($input['id_menu']  ?? 0);
$nombre   = trim($input['nombre']    ?? '');
$icono    = trim($input['icono']     ?? '');
$url      = trim($input['url']       ?? '');
$modulo   = trim($input['modulo']    ?? '');
$orden    = (int)($input['orden']    ?? 0);
$estado   = isset($input['estado']) ? (int)$input['estado'] : 1;
$padre_id = !empty($input['padre_id']) ? (int)$input['padre_id'] : null;

if (!$id_menu || empty($nombre)) {
    responder(false, 'ID y nombre del item son obligatorios.');
}

$db   = getDB();
$stmt = $db->prepare("
    UPDATE menu
    SET nombre = ?, icono = ?, url = ?, padre_id = ?, modulo = ?, orden = ?, estado = ?
    WHERE id_menu = ?
");
$stmt->execute([
    $nombre,
    $icono  ?: null,
    $url    ?: null,
    $padre_id,
    $modulo ?: null,
    $orden,
    $estado ? 1 : 0,
    $id_menu,
]);

responder(true, 'Item de menu actualizado.');
