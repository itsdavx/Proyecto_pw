<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'configmenu', 'crear');

$nombre = trim($input['nombre'] ?? '');
$url    = trim($input['url']    ?? '');

if ($nombre === '' || $url === '') {
    responder(false, 'El nombre y la URL son obligatorios.');
}
if (!preg_match('/^\/[A-Za-z0-9_\-\/.]+$/', $url)) {
    responder(false, 'La URL debe iniciar con "/" y contener solo letras, numeros, guiones, puntos y "/".');
}

$db = getDB();

$stmt = $db->prepare("SELECT id_menu FROM menu WHERE url = ?");
$stmt->execute([$url]);
if ($stmt->fetch()) {
    responder(false, 'Ya existe un ItemMenu con esa URL.');
}

// Identificador de modulo unico derivado del nombre (clave interna del RBAC;
// el nombre visible para el usuario no se ve afectado por este slug)
$base = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '_', $nombre), '_'));
if ($base === '') { $base = 'item'; }

$stmtModulo = $db->prepare("SELECT COUNT(*) FROM menu WHERE modulo = ?");
$modulo = $base;
$sufijo = 2;
$stmtModulo->execute([$modulo]);
while ((int)$stmtModulo->fetchColumn() > 0) {
    $modulo = $base . '_' . $sufijo++;
    $stmtModulo->execute([$modulo]);
}

$stmt = $db->prepare("SELECT COALESCE(MAX(orden), 0) + 1 FROM menu");
$stmt->execute();
$orden = (int)$stmt->fetchColumn();

// Nace deshabilitado (estado 0): el Administrador lo activa y le asigna
// roles desde Permisos cuando esté listo.
$stmt = $db->prepare("
    INSERT INTO menu (nombre, icono, url, modulo, orden, estado)
    VALUES (?, 'fa-list', ?, ?, ?, 0)
");
$stmt->execute([$nombre, $url, $modulo, $orden]);

responder(true, 'ItemMenu creado correctamente. Actívelo aquí y asígnelo a un rol desde Permisos.', [
    'id_menu' => (int)$db->lastInsertId(),
]);
