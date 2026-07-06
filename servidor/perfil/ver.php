<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$db   = getDB();
$stmt = $db->prepare("
    SELECT u.id_user, u.username, u.nombre, u.email, u.created_at, r.nombre_rol
    FROM   pw_user u
    INNER JOIN roles r ON r.id_rol = u.id_rol
    WHERE  u.id_user = ?
");
$stmt->execute([$sesion['id_user']]);
$perfil = $stmt->fetch();

if (!$perfil) {
    responder(false, 'Usuario no encontrado.');
}

responder(true, 'OK', $perfil);
