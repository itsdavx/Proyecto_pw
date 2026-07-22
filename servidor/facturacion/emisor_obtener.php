<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame2', 'leer');

$db   = getDB();
$fila = $db->query("SELECT * FROM factura_emisor WHERE id_emisor = 1")->fetch();

responder(true, 'OK', $fila ?: []);
