<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'configmenu', 'eliminar');

$id_menu = (int)($input['id_menu'] ?? 0);
if (!$id_menu) {
    responder(false, 'ID de ItemMenu requerido.');
}

$db   = getDB();
$stmt = $db->prepare("SELECT modulo FROM menu WHERE id_menu = ? AND url IS NOT NULL");
$stmt->execute([$id_menu]);
$row = $stmt->fetch();

if (!$row) {
    responder(false, 'ItemMenu no encontrado.');
}

// El Administrador tiene control total: cualquier ItemMenu puede
// eliminarse, incluidos los del propio sistema (Dashboard, Usuarios,
// Configurar Menús, etc.). Solo se garantiza la consistencia de la BD.
$db->beginTransaction();
try {
    // Permisos asociados al modulo: no existe FK (modulo es solo una clave
    // de texto), asi que se limpian explicitamente para no dejar registros
    // huerfanos ni permisos fantasma de un modulo que ya no existe.
    $db->prepare("DELETE FROM permisos_rol WHERE modulo = ?")->execute([$row['modulo']]);

    // Al borrar el ItemMenu, las FK con ON DELETE CASCADE limpian por si
    // solas su organizacion personal (menu_orden_usuario) y sus accesos
    // rapidos ocultos (accesos_ocultos_usuario) en todos los usuarios.
    // Si algun SuperMenu queda vacio como resultado, se conserva tal cual
    // (menu_super_usuario no depende de menu_orden_usuario).
    $db->prepare("DELETE FROM menu WHERE id_menu = ?")->execute([$id_menu]);

    $db->commit();
    responder(true, 'ItemMenu eliminado correctamente.');
} catch (PDOException $e) {
    $db->rollBack();
    responder(false, 'Error al eliminar el ItemMenu: ' . $e->getMessage());
}
