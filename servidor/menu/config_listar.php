<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'configmenu', 'leer');

$db   = getDB();
$stmt = $db->prepare("
    SELECT id_menu, nombre, icono, modulo, estado
    FROM   menu
    WHERE  url IS NOT NULL
    ORDER  BY id_menu ASC
");
$stmt->execute();

responder(true, 'OK', $stmt->fetchAll());
