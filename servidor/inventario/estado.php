<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame3', 'estado');

$idProducto = (int)($input['id_producto'] ?? 0);
if (!$idProducto) responder(false, 'ID de producto requerido.');

$db = getDB();
$db->prepare("UPDATE productos SET estado = IF(estado = 1, 0, 1) WHERE id_producto = ?")
   ->execute([$idProducto]);

responder(true, 'Estado actualizado correctamente.');
