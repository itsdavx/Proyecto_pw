<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$ocultos = $input['ocultos'] ?? [];
if (!is_array($ocultos)) {
    responder(false, 'Formato inválido.');
}

$db = getDB();

try {
    $db->beginTransaction();
    $db->prepare("DELETE FROM accesos_ocultos_usuario WHERE id_user = ?")->execute([$sesion['id_user']]);

    $ins = $db->prepare("INSERT IGNORE INTO accesos_ocultos_usuario (id_user, id_menu) VALUES (?, ?)");
    foreach ($ocultos as $id) {
        $id = (int)$id;
        if ($id > 0) { $ins->execute([$sesion['id_user'], $id]); }
    }

    $db->commit();
    responder(true, 'Accesos rápidos actualizados.');
} catch (PDOException $e) {
    if ($db->inTransaction()) { $db->rollBack(); }
    responder(false, 'Ejecute el script actualizacion_mejoras_v5.sql (tabla accesos_ocultos_usuario).');
}
