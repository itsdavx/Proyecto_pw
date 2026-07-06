<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'leer');

$supers = $input['supers'] ?? [];
$items  = $input['items']  ?? [];

if (!is_array($supers) || !is_array($items)) {
    responder(false, 'Formato de organización inválido.');
}

$db = getDB();

// SuperMenus propios del usuario (no puede tocar los de otros)
$stmt = $db->prepare("SELECT id_super FROM menu_super_usuario WHERE id_user = ?");
$stmt->execute([$sesion['id_user']]);
$propios = array_map('intval', array_column($stmt->fetchAll(), 'id_super'));

$db->beginTransaction();
try {
    $updSuper = $db->prepare("UPDATE menu_super_usuario SET orden = ? WHERE id_super = ? AND id_user = ?");
    foreach ($supers as $s) {
        $id = (int)($s['id_super'] ?? 0);
        if (in_array($id, $propios)) {
            $updSuper->execute([(int)($s['orden'] ?? 0), $id, $sesion['id_user']]);
        }
    }

    $repItem = $db->prepare("REPLACE INTO menu_orden_usuario (id_user, id_menu, orden, id_super) VALUES (?, ?, ?, ?)");
    foreach ($items as $it) {
        $id_menu  = (int)($it['id_menu'] ?? 0);
        $id_super = (int)($it['id_super'] ?? 0);
        if ($id_menu) {
            $repItem->execute([
                $sesion['id_user'],
                $id_menu,
                (int)($it['orden'] ?? 0),
                in_array($id_super, $propios) ? $id_super : null,
            ]);
        }
    }

    $db->commit();
    responder(true, 'Menú guardado.');
} catch (PDOException $e) {
    $db->rollBack();
    responder(false, 'Error al guardar el menú: ' . $e->getMessage());
}
