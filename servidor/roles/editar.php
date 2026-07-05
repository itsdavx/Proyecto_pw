<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'roles', 'editar');

$id_rol      = (int)($input['id_rol']      ?? 0);
$nombre_rol  = trim($input['nombre_rol']   ?? '');
$descripcion = trim($input['descripcion']  ?? '');
$estado      = isset($input['estado']) ? (int)$input['estado'] : 1;

if (!$id_rol || empty($nombre_rol)) {
    responder(false, 'ID y nombre del rol son obligatorios.');
}
if ($id_rol === 1) {
    responder(false, 'El rol Administrador no puede modificarse.');
}

$db = getDB();

$stmt = $db->prepare("SELECT id_rol FROM roles WHERE nombre_rol = ? AND id_rol != ?");
$stmt->execute([$nombre_rol, $id_rol]);
if ($stmt->fetch()) { responder(false, 'Ya existe otro rol con ese nombre.'); }

$stmt = $db->prepare("UPDATE roles SET nombre_rol = ?, descripcion = ?, estado = ? WHERE id_rol = ?");
$stmt->execute([$nombre_rol, $descripcion, $estado ? 1 : 0, $id_rol]);

responder(true, 'Rol actualizado correctamente.');
