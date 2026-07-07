<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'menu', 'eliminar');

$id_super = (int)($input['id_super'] ?? 0);
if (!$id_super) {
    responder(false, 'ID de SuperMenu requerido.');
}

$db = getDB();

$stmt = $db->prepare("SELECT protegido FROM menu_super_usuario WHERE id_super = ? AND id_user = ?");
$stmt->execute([$id_super, $sesion['id_user']]);
$row = $stmt->fetch();

if (!$row) {
    responder(false, 'SuperMenu no encontrado.');
}
if ((int)$row['protegido'] === 1) {
    responder(false, 'Este SuperMenu es obligatorio para todos los usuarios y no puede eliminarse.');
}

$db->beginTransaction();
try {
    // Siguiente posicion libre en la raiz: ItemMenus sueltos y SuperMenus
    // comparten una misma secuencia de orden.
    $stmt = $db->prepare("
        SELECT GREATEST(
            COALESCE((SELECT MAX(orden) FROM menu_super_usuario WHERE id_user = ?), 0),
            COALESCE((SELECT MAX(orden) FROM menu_orden_usuario WHERE id_user = ? AND id_super IS NULL), 0)
        ) AS maximo
    ");
    $stmt->execute([$sesion['id_user'], $sesion['id_user']]);
    $siguiente = (int)$stmt->fetch()['maximo'] + 1;

    // Los ItemMenu del SuperMenu eliminado pasan a "Elementos sin agrupar",
    // conservando el orden relativo que tenian entre si.
    $stmt = $db->prepare("SELECT id_menu FROM menu_orden_usuario WHERE id_user = ? AND id_super = ? ORDER BY orden ASC");
    $stmt->execute([$sesion['id_user'], $id_super]);
    $items = $stmt->fetchAll();

    $upd = $db->prepare("UPDATE menu_orden_usuario SET id_super = NULL, orden = ? WHERE id_user = ? AND id_menu = ?");
    foreach ($items as $it) {
        $upd->execute([$siguiente++, $sesion['id_user'], $it['id_menu']]);
    }

    $db->prepare("DELETE FROM menu_super_usuario WHERE id_super = ? AND id_user = ?")
       ->execute([$id_super, $sesion['id_user']]);

    $db->commit();
    responder(true, 'SuperMenu eliminado. Sus elementos pasaron a Elementos sin agrupar.');
} catch (PDOException $e) {
    $db->rollBack();
    responder(false, 'Error al eliminar el SuperMenu: ' . $e->getMessage());
}
