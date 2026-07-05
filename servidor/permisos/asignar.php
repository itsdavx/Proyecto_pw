<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'permisos', 'crear');

$id_rol = (int)($input['id_rol'] ?? 0);
// El JS envía JSON, así que $input['permisos'] ya es un array PHP
$lista  = $input['permisos'] ?? [];

if (!$id_rol) {
    responder(false, 'ID de rol requerido.');
}
if ($id_rol === 1) {
    responder(false, 'Los permisos del rol Administrador no pueden modificarse.');
}
if (!is_array($lista)) {
    responder(false, 'Formato de permisos invalido.');
}

$modulosValidos  = ['dashboard','usuarios','roles','permisos','menu','opciones','perfil'];
$accionesValidas = ['leer','crear','editar','eliminar'];

$db = getDB();
$db->beginTransaction();

try {
    $db->prepare("DELETE FROM permisos_rol WHERE id_rol = ?")->execute([$id_rol]);

    $stmt = $db->prepare("INSERT INTO permisos_rol (id_rol, modulo, accion) VALUES (?, ?, ?)");
    foreach ($lista as $p) {
        $modulo = $p['modulo'] ?? '';
        $accion = $p['accion'] ?? '';
        if (in_array($modulo, $modulosValidos) && in_array($accion, $accionesValidas)) {
            $stmt->execute([$id_rol, $modulo, $accion]);
        }
    }

    $db->commit();
    responder(true, 'Permisos actualizados correctamente.');
} catch (PDOException $e) {
    $db->rollBack();
    responder(false, 'Error al guardar permisos: ' . $e->getMessage());
}
