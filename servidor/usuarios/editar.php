<?php
// Edita datos del usuario
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'usuarios', 'editar');

$id_user  = (int)($input['id_user']  ?? 0);
$username = trim($input['username']  ?? '');
$nombre   = trim($input['nombre']    ?? '');
$email    = trim($input['email']     ?? '');
$id_rol   = (int)($input['id_rol']   ?? 0);
$password = $input['password']       ?? '';

if (!$id_user || empty($username) || empty($nombre) || empty($email) || !$id_rol) {
    responder(false, 'Todos los campos son obligatorios.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'El email no es valido.');
}
if ($id_user === 1 && $id_rol !== 1) {
    responder(false, 'No se puede cambiar el rol del Administrador principal.');
}
if ($id_rol === 1 && $sesion['id_rol'] !== 1) {
    responder(false, 'Solo el Administrador puede asignar el rol Admin.');
}

$db = getDB();

$stmt = $db->prepare("SELECT id_rol FROM pw_user WHERE id_user = ?");
$stmt->execute([$id_user]);
$actual = $stmt->fetch();
if (!$actual) {
    responder(false, 'Usuario no encontrado.');
}
if ((int)$actual['id_rol'] !== $id_rol) {
    verificarPermiso($sesion['id_rol'], 'usuarios', 'cambiar_rol');
}

$stmt = $db->prepare("SELECT id_user FROM pw_user WHERE username = ? AND id_user != ?");
$stmt->execute([$username, $id_user]);
if ($stmt->fetch()) { responder(false, 'El nombre de usuario ya esta en uso.'); }

$stmt = $db->prepare("SELECT id_user FROM pw_user WHERE email = ? AND id_user != ?");
$stmt->execute([$email, $id_user]);
if ($stmt->fetch()) { responder(false, 'El email ya esta en uso por otro usuario.'); }

$stmt = $db->prepare("
    UPDATE pw_user
    SET username = ?, nombre = ?, email = ?, id_rol = ?, updated_at = NOW()
    WHERE id_user = ?
");
$stmt->execute([$username, $nombre, $email, $id_rol, $id_user]);

if (!empty($password)) {
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $db->prepare("UPDATE pw_user SET password = ?, primer_login = 1, updated_at = NOW() WHERE id_user = ?")
       ->execute([$hash, $id_user]);
}

responder(true, 'Usuario actualizado correctamente.');
