<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'leer');

$nombre = trim($input['nombre'] ?? '');
if ($nombre === '') {
    responder(false, 'El nombre del SuperMenu es obligatorio.');
}

$db   = getDB();
$stmt = $db->prepare("SELECT COALESCE(MAX(orden), 100) + 1 AS sig FROM menu_super_usuario WHERE id_user = ?");
$stmt->execute([$sesion['id_user']]);
$orden = (int)$stmt->fetch()['sig'];

$db->prepare("INSERT INTO menu_super_usuario (id_user, nombre, orden) VALUES (?, ?, ?)")
   ->execute([$sesion['id_user'], $nombre, $orden]);

responder(true, 'SuperMenu creado.', ['id_super' => (int)$db->lastInsertId()]);
