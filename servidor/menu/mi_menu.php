<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'leer');

$db      = getDB();
$esAdmin = (int)$sesion['id_rol'] === 1;

// ItemMenus activos permitidos (sin URL: el usuario no la ve ni la modifica)
if ($esAdmin) {
    $stmt = $db->prepare("SELECT id_menu, nombre, icono, modulo, orden FROM menu WHERE estado = 1 AND url IS NOT NULL ORDER BY orden ASC");
    $stmt->execute();
} else {
    $stmt = $db->prepare("SELECT modulo FROM permisos_rol WHERE id_rol = ? AND accion = 'leer'");
    $stmt->execute([$sesion['id_rol']]);
    $modulosLeer = array_column($stmt->fetchAll(), 'modulo');
    if (empty($modulosLeer)) {
        responder(true, 'OK', ['supers' => [], 'items' => []]);
    }
    $placeholders = implode(',', array_fill(0, count($modulosLeer), '?'));
    $stmt = $db->prepare("SELECT id_menu, nombre, icono, modulo, orden FROM menu WHERE estado = 1 AND url IS NOT NULL AND modulo IN ($placeholders) ORDER BY orden ASC");
    $stmt->execute($modulosLeer);
}
$items = $stmt->fetchAll();

$stmt = $db->prepare("SELECT id_super, nombre, orden FROM menu_super_usuario WHERE id_user = ? ORDER BY orden ASC");
$stmt->execute([$sesion['id_user']]);
$supers = $stmt->fetchAll();

$stmt = $db->prepare("SELECT id_menu, orden, id_super FROM menu_orden_usuario WHERE id_user = ?");
$stmt->execute([$sesion['id_user']]);
$org = [];
foreach ($stmt->fetchAll() as $o) {
    $org[$o['id_menu']] = $o;
}

$superIds = array_column($supers, 'id_super');

foreach ($items as &$it) {
    $o = $org[$it['id_menu']] ?? null;
    $it['id_super'] = ($o && $o['id_super'] && in_array($o['id_super'], $superIds)) ? (int)$o['id_super'] : null;
    $it['orden']    = $o !== null ? (int)$o['orden'] : (int)$it['orden'];
}
unset($it);

usort($items, function ($a, $b) {
    return [$a['orden'], (int)$a['id_menu']] <=> [$b['orden'], (int)$b['id_menu']];
});

responder(true, 'OK', ['supers' => $supers, 'items' => $items]);
