<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame1', 'eliminar');

$id_tarea = (int)($input['id_tarea'] ?? 0);

if (!$id_tarea) {
    responder(false, 'ID de tarea requerido.');
}

$db = getDB();
$db->prepare("DELETE FROM tareas WHERE id_tarea = ?")->execute([$id_tarea]);

responder(true, 'Tarea eliminada correctamente.');
