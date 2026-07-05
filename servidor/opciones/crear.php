<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'opciones', 'crear');

$id_menu = (int)($input['id_menu'] ?? 0);
$nombre  = trim($input['nombre']   ?? '');
$accion  = trim($input['accion']   ?? '');
$orden   = (int)($input['orden']   ?? 0);
$estado  = isset($input['estado']) ? (int)$input['estado'] : 1;

if (!$id_menu || empty($nombre)) {
    responder(false, 'ID de menu y nombre son obligatorios.');
}

$db   = getDB();
$stmt = $db->prepare("
    INSERT INTO menu_opciones (id_menu, nombre, accion, orden, estado)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->execute([$id_menu, $nombre, $accion ?: null, $orden, $estado ? 1 : 0]);

responder(true, 'Opcion creada.', ['id_opcion' => (int)$db->lastInsertId()]);
