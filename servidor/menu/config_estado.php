<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'configmenu', 'estado');

$id_menu = (int)($input['id_menu'] ?? 0);
$estado  = (int)($input['estado']  ?? -1);

if (!$id_menu)                { responder(false, 'ID de ItemMenu requerido.'); }
if ($estado !== 0 && $estado !== 1) { responder(false, 'Estado inválido.'); }

$db   = getDB();
$stmt = $db->prepare("SELECT modulo FROM menu WHERE id_menu = ? AND url IS NOT NULL");
$stmt->execute([$id_menu]);
$row = $stmt->fetch();

if (!$row) {
    responder(false, 'ItemMenu no encontrado.');
}
if ($row['modulo'] === 'configmenu' && $estado === 0) {
    responder(false, 'Configurar Menús no puede desactivarse.');
}

$db->prepare("UPDATE menu SET estado = ? WHERE id_menu = ?")->execute([$estado, $id_menu]);

responder(true, $estado ? 'ItemMenu activado.' : 'ItemMenu desactivado.');
