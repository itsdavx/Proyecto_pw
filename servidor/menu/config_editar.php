<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'configmenu', 'editar');

$id_menu = (int)($input['id_menu'] ?? 0);
$nombre  = trim($input['nombre'] ?? '');
$url     = trim($input['url']    ?? '');

if (!$id_menu) {
    responder(false, 'ID de ItemMenu requerido.');
}
if ($nombre === '' || $url === '') {
    responder(false, 'El nombre y la URL son obligatorios.');
}
if (!preg_match('/^\/[A-Za-z0-9_\-\/.]+$/', $url)) {
    responder(false, 'La URL debe iniciar con "/" y contener solo letras, numeros, guiones, puntos y "/".');
}

$db = getDB();

$stmt = $db->prepare("SELECT id_menu FROM menu WHERE id_menu = ? AND url IS NOT NULL");
$stmt->execute([$id_menu]);
if (!$stmt->fetch()) {
    responder(false, 'ItemMenu no encontrado.');
}

$stmt = $db->prepare("SELECT id_menu FROM menu WHERE url = ? AND id_menu != ?");
$stmt->execute([$url, $id_menu]);
if ($stmt->fetch()) {
    responder(false, 'Ya existe otro ItemMenu con esa URL.');
}

// Unicamente nombre y URL: modulo, estado y orden no se modifican aqui.
$db->prepare("UPDATE menu SET nombre = ?, url = ? WHERE id_menu = ?")
   ->execute([$nombre, $url, $id_menu]);

responder(true, 'ItemMenu actualizado correctamente.');
