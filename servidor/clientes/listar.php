<?php
// Lista o busca clientes
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

// Acceso desde dos módulos
$puede = false;
foreach (['frame4', 'frame2'] as $mod) {
    if (moduloActivo($mod) && rolTienePermiso($sesion['id_rol'], $mod, 'leer')) {
        $puede = true;
        break;
    }
}
if (!$puede) responder(false, 'Sin permiso para esta accion.');

$busqueda = trim((string)($input['busqueda'] ?? ''));
$limite   = isset($input['limite']) ? max(1, min(50, (int)$input['limite'])) : null;

$db     = getDB();
$sql    = "SELECT id_cliente, tipo_identificacion, identificacion, razon_social, direccion, email, telefono, estado
           FROM   clientes";
$params = [];

if ($busqueda !== '') {
    $comodin = '%' . $busqueda . '%';
    $sql    .= " WHERE (identificacion LIKE ? OR razon_social LIKE ?) ORDER BY razon_social ASC";
    $params  = [$comodin, $comodin];
} else {
    $sql .= " ORDER BY id_cliente DESC";
}

if ($limite !== null) {
    $sql .= " LIMIT " . $limite;
}

$stmt = $db->prepare($sql);
$stmt->execute($params);

responder(true, 'OK', $stmt->fetchAll());
