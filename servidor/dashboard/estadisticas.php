<?php
require_once dirname(__DIR__) . '/config.php';

$input = getInput();
$token = $input['token'] ?? '';
verificarSesion($token);

$db = getDB();

$contar = function (string $sql) use ($db): int {
    return (int)$db->query($sql)->fetchColumn();
};

responder(true, 'OK', [
    'usuarios' => $contar("SELECT COUNT(*) FROM pw_user"),
    'roles'    => $contar("SELECT COUNT(*) FROM roles"),
    'permisos' => $contar("SELECT COUNT(*) FROM permisos_rol"),
]);
