<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'eliminar');

$id_menu = (int)($input['id_menu'] ?? 0);

if (!$id_menu) {
    responder(false, 'ID de menu requerido.');
}

$db = getDB();

$stmt = $db->prepare("SELECT COUNT(*) as total FROM menu WHERE padre_id = ?");
$stmt->execute([$id_menu]);
$hijos = $stmt->fetch();
if ($hijos['total'] > 0) {
    responder(false, 'No se puede eliminar: el item tiene sub-items. Eliminalos primero.');
}

$db->prepare("DELETE FROM menu WHERE id_menu = ?")->execute([$id_menu]);

responder(true, 'Item de menu eliminado.');
