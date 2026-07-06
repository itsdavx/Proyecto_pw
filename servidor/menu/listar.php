<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$db      = getDB();
$esAdmin = (int)$sesion['id_rol'] === 1;

// ── ItemMenus globales activos permitidos para el rol ────────
if ($esAdmin) {
    $stmt = $db->prepare("
        SELECT id_menu, nombre, icono, url, modulo, orden
        FROM   menu
        WHERE  estado = 1 AND url IS NOT NULL
        ORDER  BY orden ASC
    ");
    $stmt->execute();
} else {
    $stmt = $db->prepare("SELECT modulo FROM permisos_rol WHERE id_rol = ? AND accion = 'leer'");
    $stmt->execute([$sesion['id_rol']]);
    $modulosLeer = array_column($stmt->fetchAll(), 'modulo');

    if (empty($modulosLeer)) {
        responder(true, 'OK', []);
    }

    $placeholders = implode(',', array_fill(0, count($modulosLeer), '?'));
    $stmt = $db->prepare("
        SELECT id_menu, nombre, icono, url, modulo, orden
        FROM   menu
        WHERE  estado = 1 AND url IS NOT NULL AND modulo IN ($placeholders)
        ORDER  BY orden ASC
    ");
    $stmt->execute($modulosLeer);
}
$items = $stmt->fetchAll();

// ── Organización personal: SuperMenus propios y ubicación ────
$supers = [];
$org    = [];
try {
    $stmt = $db->prepare("SELECT id_super, nombre, orden FROM menu_super_usuario WHERE id_user = ? ORDER BY orden ASC");
    $stmt->execute([$sesion['id_user']]);
    $supers = $stmt->fetchAll();

    $stmt = $db->prepare("SELECT id_menu, orden, id_super FROM menu_orden_usuario WHERE id_user = ?");
    $stmt->execute([$sesion['id_user']]);
    foreach ($stmt->fetchAll() as $o) {
        $org[$o['id_menu']] = $o;
    }
} catch (PDOException $e) { /* migración v3 pendiente: sin organización personal */ }

$superIds = array_column($supers, 'id_super');

// ── Componer salida con la misma forma que consume el sidebar ─
$salida = [];
foreach ($supers as $s) {
    $salida[] = [
        'id_menu'  => 's' . $s['id_super'],
        'nombre'   => $s['nombre'],
        'icono'    => 'fa-bars',
        'url'      => null,
        'padre_id' => null,
        'modulo'   => null,
        'orden'    => (int)$s['orden'],
    ];
}
foreach ($items as $it) {
    $o     = $org[$it['id_menu']] ?? null;
    $padre = ($o && $o['id_super'] && in_array($o['id_super'], $superIds)) ? 's' . $o['id_super'] : null;
    $salida[] = [
        'id_menu'  => $it['id_menu'],
        'nombre'   => $it['nombre'],
        'icono'    => $it['icono'],
        'url'      => $it['url'],
        'padre_id' => $padre,
        'modulo'   => $it['modulo'],
        'orden'    => $o !== null ? (int)$o['orden'] : (int)$it['orden'],
    ];
}

usort($salida, function ($a, $b) {
    return [$a['orden'], (string)$a['id_menu']] <=> [$b['orden'], (string)$b['id_menu']];
});

// Ocultar SuperMenus vacíos
$padresConHijos = array_filter(array_column($salida, 'padre_id'));
$salida = array_values(array_filter($salida, function ($m) use ($padresConHijos) {
    return $m['url'] !== null || in_array($m['id_menu'], $padresConHijos);
}));

responder(true, 'OK', $salida);
