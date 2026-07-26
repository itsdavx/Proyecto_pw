<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

// El listado de clientes alimenta tanto al módulo Clientes (frame4)
// como a Facturación (frame2, selector de Nueva Factura). Basta con
// poder leer uno de los dos módulos.
$puede = false;
foreach (['frame4', 'frame2'] as $mod) {
    if (moduloActivo($mod) && rolTienePermiso($sesion['id_rol'], $mod, 'leer')) {
        $puede = true;
        break;
    }
}
if (!$puede) responder(false, 'Sin permiso para esta accion.');

// El módulo Clientes (frame4) pide el listado completo para su propia
// paginación en el cliente. El selector de Cliente en Nueva Factura
// (frame2), en cambio, busca por texto y limita el resultado, para
// que ese selector escale sin importar cuántos clientes existan.
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
