<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$db = getDB();

// Super-admin ve todo el menú sin filtrar por permisos
if ((int)$sesion['id_rol'] === 1) {
    $stmt = $db->prepare("
        SELECT id_menu, nombre, icono, url, padre_id, modulo, orden
        FROM   menu
        WHERE  estado = 1
        ORDER  BY orden ASC
    ");
    $stmt->execute();
    responder(true, 'OK', $stmt->fetchAll());
}

// Obtener módulos que el rol puede leer
$stmt = $db->prepare("SELECT modulo FROM permisos_rol WHERE id_rol = ? AND accion = 'leer'");
$stmt->execute([$sesion['id_rol']]);
$modulosLeer = array_column($stmt->fetchAll(), 'modulo');

if (empty($modulosLeer)) {
    responder(true, 'OK', []);
}

$placeholders = implode(',', array_fill(0, count($modulosLeer), '?'));

$stmt = $db->prepare("
    SELECT id_menu, nombre, icono, url, padre_id, modulo, orden
    FROM   menu
    WHERE  estado = 1
    AND    (modulo IS NULL OR modulo IN ($placeholders))
    ORDER  BY orden ASC
");
$stmt->execute($modulosLeer);

responder(true, 'OK', $stmt->fetchAll());
