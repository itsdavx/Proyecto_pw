<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$db   = getDB();
$stmt = $db->prepare("SELECT modulo, accion FROM permisos_rol WHERE id_rol = ?");
$stmt->execute([$sesion['id_rol']]);
$permisos = $stmt->fetchAll();

// Obtener nombre del rol
$stmt = $db->prepare("SELECT nombre_rol FROM roles WHERE id_rol = ?");
$stmt->execute([$sesion['id_rol']]);
$rol = $stmt->fetch();

// Respuesta esperada por session.js: {usuario:{}, permisos:[]}
responder(true, 'Sesion valida.', [
    'usuario' => [
        'id_user'     => (int)$sesion['id_user'],
        'username'    => $sesion['username'],
        'nombre'      => $sesion['nombre'],
        'id_rol'      => (int)$sesion['id_rol'],
        'rol'         => $rol['nombre_rol'] ?? '',
        'primer_login'=> (int)$sesion['primer_login'],
    ],
    'permisos' => $permisos,
]);
