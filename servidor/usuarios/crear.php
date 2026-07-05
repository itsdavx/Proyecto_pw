<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'usuarios', 'crear');

$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$nombre   = trim($input['nombre']   ?? '');
$email    = trim($input['email']    ?? '');
$id_rol   = (int)($input['id_rol']  ?? 0);

if (empty($username) || empty($password) || empty($nombre) || empty($email) || !$id_rol) {
    responder(false, 'Todos los campos son obligatorios.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'El email no es valido.');
}
if ($id_rol === 1 && $sesion['id_rol'] !== 1) {
    responder(false, 'Solo el Administrador puede asignar el rol Admin.');
}

$db = getDB();

$stmt = $db->prepare("SELECT id_user FROM pw_user WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) { responder(false, 'El nombre de usuario ya existe.'); }

$stmt = $db->prepare("SELECT id_user FROM pw_user WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) { responder(false, 'El email ya esta registrado.'); }

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$stmt = $db->prepare("
    INSERT INTO pw_user (username, password, nombre, email, id_rol, estado, primer_login, created_by)
    VALUES (?, ?, ?, ?, ?, 1, 1, ?)
");
$stmt->execute([$username, $hash, $nombre, $email, $id_rol, $sesion['id_user']]);

responder(true, 'Usuario creado correctamente.', ['id_user' => (int)$db->lastInsertId()]);
