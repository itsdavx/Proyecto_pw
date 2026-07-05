<?php
require_once dirname(__DIR__) . '/config.php';

$input = getInput();
$token = $input['token'] ?? '';

if (empty($token)) {
    responder(false, 'Token requerido.');
}

$db = getDB();
$db->prepare("DELETE FROM sesiones WHERE token = ?")
   ->execute([$token]);

responder(true, 'Sesion cerrada correctamente.');
