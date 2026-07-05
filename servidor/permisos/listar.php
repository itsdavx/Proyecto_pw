<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'permisos', 'leer');

$id_rol = (int)($input['id_rol'] ?? 0);

if (!$id_rol) {
    responder(false, 'ID de rol requerido.');
}

$db   = getDB();
$stmt = $db->prepare("SELECT id, modulo, accion FROM permisos_rol WHERE id_rol = ? ORDER BY modulo, accion");
$stmt->execute([$id_rol]);
$permisos = $stmt->fetchAll();

responder(true, 'OK', $permisos);
