<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame1', 'editar');

$id_tarea    = (int)($input['id_tarea'] ?? 0);
$titulo      = trim($input['titulo'] ?? '');
$descripcion = trim($input['descripcion'] ?? '');

if (!$id_tarea) {
    responder(false, 'ID de tarea requerido.');
}
if ($titulo === '') {
    responder(false, 'El título es obligatorio.');
}

$db = getDB();
$db->prepare("UPDATE tareas SET titulo = ?, descripcion = ? WHERE id_tarea = ?")
   ->execute([$titulo, $descripcion !== '' ? $descripcion : null, $id_tarea]);

responder(true, 'Tarea actualizada correctamente.');
