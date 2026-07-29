<?php
// Elimina rol sin usuarios
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'roles', 'eliminar');

$id_rol = (int)($input['id_rol'] ?? 0);
if (!$id_rol) {
    responder(false, 'ID de rol requerido.');
}
if ($id_rol === 1) {
    responder(false, 'El rol Administrador no puede eliminarse.');
}

$db   = getDB();
$stmt = $db->prepare("SELECT nombre_rol FROM roles WHERE id_rol = ?");
$stmt->execute([$id_rol]);
$rol = $stmt->fetch();

if (!$rol) {
    responder(false, 'Rol no encontrado.');
}

$stmt = $db->prepare("SELECT COUNT(*) FROM pw_user WHERE id_rol = ?");
$stmt->execute([$id_rol]);
$totalUsuarios = (int)$stmt->fetchColumn();

if ($totalUsuarios > 0) {
    $plural = $totalUsuarios === 1 ? 'usuario' : 'usuarios';
    responder(false, "No se puede eliminar: hay {$totalUsuarios} {$plural} con el rol \"{$rol['nombre_rol']}\". Reasigne o elimine esos usuarios antes de continuar.");
}

$db->prepare("DELETE FROM roles WHERE id_rol = ?")->execute([$id_rol]);

responder(true, 'Rol eliminado correctamente.');
