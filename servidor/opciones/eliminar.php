<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'opciones', 'eliminar');

$id_opcion = (int)($input['id_opcion'] ?? 0);

if (!$id_opcion) {
    responder(false, 'ID de opcion requerido.');
}

$db = getDB();
$db->prepare("DELETE FROM menu_opciones WHERE id_opcion = ?")->execute([$id_opcion]);

responder(true, 'Opcion eliminada.');
