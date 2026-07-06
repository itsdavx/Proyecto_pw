<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame1', 'crear');

$titulo      = trim($input['titulo'] ?? '');
$descripcion = trim($input['descripcion'] ?? '');

if ($titulo === '') {
    responder(false, 'El título es obligatorio.');
}

$db = getDB();
$db->prepare("INSERT INTO tareas (titulo, descripcion, created_by) VALUES (?, ?, ?)")
   ->execute([$titulo, $descripcion !== '' ? $descripcion : null, $sesion['id_user']]);

responder(true, 'Tarea creada correctamente.');
