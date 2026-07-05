<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'opciones', 'leer');

$id_menu = (int)($input['id_menu'] ?? 0);

if (!$id_menu) {
    responder(false, 'ID de menu requerido.');
}

$db   = getDB();
$stmt = $db->prepare("
    SELECT id_opcion, id_menu, nombre, accion, orden, estado
    FROM   menu_opciones
    WHERE  id_menu = ?
    ORDER  BY orden ASC
");
$stmt->execute([$id_menu]);
$opciones = $stmt->fetchAll();

responder(true, 'OK', $opciones);
