<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame1', 'leer');

$db   = getDB();
$stmt = $db->prepare("
    SELECT t.id_tarea, t.titulo, t.descripcion, t.created_at, u.nombre AS creador
    FROM   tareas t
    LEFT JOIN pw_user u ON u.id_user = t.created_by
    ORDER  BY t.id_tarea DESC
");
$stmt->execute();

responder(true, 'OK', $stmt->fetchAll());
