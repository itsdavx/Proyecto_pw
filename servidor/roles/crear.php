<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'roles', 'crear');

$nombre_rol  = trim($input['nombre_rol']  ?? '');
$descripcion = trim($input['descripcion'] ?? '');
$estado      = isset($input['estado']) ? (int)$input['estado'] : 1;

if (empty($nombre_rol)) {
    responder(false, 'El nombre del rol es obligatorio.');
}

$db = getDB();

$stmt = $db->prepare("SELECT id_rol FROM roles WHERE nombre_rol = ?");
$stmt->execute([$nombre_rol]);
if ($stmt->fetch()) { responder(false, 'Ya existe un rol con ese nombre.'); }

$stmt = $db->prepare("INSERT INTO roles (nombre_rol, descripcion, estado) VALUES (?, ?, ?)");
$stmt->execute([$nombre_rol, $descripcion, $estado ? 1 : 0]);

responder(true, 'Rol creado correctamente.', ['id_rol' => (int)$db->lastInsertId()]);
