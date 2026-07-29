<?php
// Elimina ItemMenu y permisos
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

$db->beginTransaction();
try {
    $db->prepare("DELETE FROM permisos_rol WHERE modulo = ?")->execute([$row['modulo']]);

    $db->prepare("DELETE FROM menu WHERE id_menu = ?")->execute([$id_menu]);

    $db->commit();
    responder(true, 'ItemMenu eliminado correctamente.');
} catch (PDOException $e) {
    $db->rollBack();
    responder(false, 'Error al eliminar el ItemMenu: ' . $e->getMessage());
}
