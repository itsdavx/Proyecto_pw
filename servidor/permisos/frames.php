<?php
require_once dirname(__DIR__) . '/config.php';
require_once __DIR__ . '/registro.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'permisos', 'leer');

responder(true, 'OK', obtenerRegistroFrames());
