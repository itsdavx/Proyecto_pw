<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'leer');

$id_super = (int)($input['id_super'] ?? 0);
$nombre   = trim($input['nombre'] ?? '');

if (!$id_super)      { responder(false, 'ID de SuperMenu requerido.'); }
if ($nombre === '')  { responder(false, 'El nombre es obligatorio.'); }

$db   = getDB();
$stmt = $db->prepare("UPDATE menu_super_usuario SET nombre = ? WHERE id_super = ? AND id_user = ?");
$stmt->execute([$nombre, $id_super, $sesion['id_user']]);

if (!$stmt->rowCount()) {
    responder(false, 'SuperMenu no encontrado.');
}
responder(true, 'SuperMenu renombrado.');
