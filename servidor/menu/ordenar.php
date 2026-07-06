<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

$items = $input['items'] ?? [];
if (!is_array($items) || empty($items)) {
    responder(false, 'Sin datos de orden.');
}

$db   = getDB();
$stmt = $db->prepare("REPLACE INTO menu_orden_usuario (id_user, id_menu, orden) VALUES (?, ?, ?)");

foreach ($items as $it) {
    $id_menu = (int)($it['id_menu'] ?? 0);
    $orden   = (int)($it['orden']   ?? 0);
    if ($id_menu) {
        $stmt->execute([$sesion['id_user'], $id_menu, $orden]);
    }
}

responder(true, 'Orden guardado.');
