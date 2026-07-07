<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token']  ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'usuarios', 'desactivar');

$id_user = (int)($input['id_user'] ?? 0);

if (!$id_user) {
    responder(false, 'ID de usuario requerido.');
}
if ($id_user === 1) {
    responder(false, 'El Administrador principal no puede desactivarse.');
}

$db = getDB();

// Leer estado actual y alternarlo
$stmt = $db->prepare("SELECT estado FROM pw_user WHERE id_user = ?");
$stmt->execute([$id_user]);
$row = $stmt->fetch();
if (!$row) { responder(false, 'Usuario no encontrado.'); }

$nuevo_estado = $row['estado'] ? 0 : 1;

$db->prepare("UPDATE pw_user SET estado = ?, updated_at = NOW() WHERE id_user = ?")
   ->execute([$nuevo_estado, $id_user]);

$msg = $nuevo_estado ? 'Usuario activado.' : 'Usuario desactivado.';
responder(true, $msg);
