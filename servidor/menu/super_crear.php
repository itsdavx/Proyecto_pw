<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'crear');

$nombre = trim($input['nombre'] ?? '');
if ($nombre === '') {
    responder(false, 'El nombre del SuperMenu es obligatorio.');
}

$db = getDB();

// Siguiente posición al final de la raíz (ItemMenus sueltos y SuperMenus
// comparten una misma secuencia de orden)
$stmt = $db->prepare("
    SELECT GREATEST(
        COALESCE((SELECT MAX(orden) FROM menu_super_usuario WHERE id_user = ?), 0),
        COALESCE((SELECT MAX(orden) FROM menu_orden_usuario WHERE id_user = ? AND id_super IS NULL), 0)
    ) + 1 AS sig
");
$stmt->execute([$sesion['id_user'], $sesion['id_user']]);
$orden = (int)$stmt->fetch()['sig'];

$db->prepare("INSERT INTO menu_super_usuario (id_user, nombre, orden) VALUES (?, ?, ?)")
   ->execute([$sesion['id_user'], $nombre, $orden]);

responder(true, 'SuperMenu creado.', ['id_super' => (int)$db->lastInsertId()]);
