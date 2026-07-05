<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'roles', 'leer');

$db   = getDB();
$stmt = $db->prepare("SELECT id_rol, nombre_rol, descripcion, estado FROM roles ORDER BY id_rol ASC");
$stmt->execute();
$roles = $stmt->fetchAll();

responder(true, 'OK', $roles);
