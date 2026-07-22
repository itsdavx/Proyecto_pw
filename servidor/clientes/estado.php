<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame4', 'estado');

$idCliente = (int)($input['id_cliente'] ?? 0);
if (!$idCliente) responder(false, 'ID de cliente requerido.');

$db = getDB();
$db->prepare("UPDATE clientes SET estado = IF(estado = 1, 0, 1) WHERE id_cliente = ?")
   ->execute([$idCliente]);

responder(true, 'Estado actualizado correctamente.');
