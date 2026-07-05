<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$password_actual = $input['password_actual'] ?? '';
$password_nuevo  = $input['password_nuevo']  ?? '';

if (empty($password_actual) || empty($password_nuevo)) {
    responder(false, 'Todos los campos son obligatorios.');
}

// Política de contraseña
if (strlen($password_nuevo) < 8) {
    responder(false, 'La contrasena debe tener al menos 8 caracteres.');
}
if (!preg_match('/[A-Z]/', $password_nuevo)) {
    responder(false, 'La contrasena debe tener al menos una letra mayuscula.');
}
if (!preg_match('/[0-9]/', $password_nuevo)) {
    responder(false, 'La contrasena debe tener al menos un numero.');
}
if (!preg_match('/[^A-Za-z0-9]/', $password_nuevo)) {
    responder(false, 'La contrasena debe tener al menos un caracter especial.');
}

$db = getDB();

$stmt = $db->prepare("SELECT password FROM pw_user WHERE id_user = ?");
$stmt->execute([$sesion['id_user']]);
$user = $stmt->fetch();

if (!$user || !password_verify($password_actual, $user['password'])) {
    responder(false, 'La contrasena actual es incorrecta.');
}

if ($password_actual === $password_nuevo) {
    responder(false, 'La nueva contrasena debe ser diferente a la actual.');
}

$hash = password_hash($password_nuevo, PASSWORD_BCRYPT, ['cost' => 12]);

$db->prepare("UPDATE pw_user SET password = ?, primer_login = 0, updated_at = NOW() WHERE id_user = ?")
   ->execute([$hash, $sesion['id_user']]);

responder(true, 'Contrasena actualizada correctamente.');
