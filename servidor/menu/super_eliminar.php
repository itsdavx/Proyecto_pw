<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'leer');

$id_super = (int)($input['id_super'] ?? 0);
if (!$id_super) {
    responder(false, 'ID de SuperMenu requerido.');
}

$db = getDB();

// Solo puede eliminarse un SuperMenu propio y vacío
$stmt = $db->prepare("SELECT COUNT(*) FROM menu_orden_usuario WHERE id_super = ? AND id_user = ?");
$stmt->execute([$id_super, $sesion['id_user']]);
if ((int)$stmt->fetchColumn() > 0) {
    responder(false, 'El SuperMenu no está vacío. Mueva sus elementos antes de eliminarlo.');
}

$stmt = $db->prepare("DELETE FROM menu_super_usuario WHERE id_super = ? AND id_user = ?");
$stmt->execute([$id_super, $sesion['id_user']]);

if (!$stmt->rowCount()) {
    responder(false, 'SuperMenu no encontrado.');
}
responder(true, 'SuperMenu eliminado.');
