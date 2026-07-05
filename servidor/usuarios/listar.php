<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'usuarios', 'leer');

$db   = getDB();
$stmt = $db->prepare("
    SELECT u.id_user, u.username, u.nombre, u.email, u.id_rol,
           r.nombre_rol AS rol,
           u.estado, u.primer_login, u.created_at
    FROM   pw_user u
    INNER JOIN roles r ON r.id_rol = u.id_rol
    ORDER  BY u.id_user ASC
");
$stmt->execute();
$usuarios = $stmt->fetchAll();

responder(true, 'OK', $usuarios);
