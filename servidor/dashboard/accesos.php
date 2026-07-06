<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$db = getDB();

// Accesos rápidos que el usuario decidió ocultar (sin filas = ver todos)
try {
    $stmt = $db->prepare("SELECT id_menu FROM accesos_ocultos_usuario WHERE id_user = ?");
    $stmt->execute([$sesion['id_user']]);
    responder(true, 'OK', array_map('intval', array_column($stmt->fetchAll(), 'id_menu')));
} catch (PDOException $e) {
    responder(true, 'OK', []); // tabla aún no creada: se muestran todos
}
