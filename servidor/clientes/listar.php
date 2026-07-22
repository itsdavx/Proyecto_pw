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

$db   = getDB();
$stmt = $db->prepare("
    SELECT id_cliente, tipo_identificacion, identificacion, razon_social, direccion, email, telefono, estado
    FROM   clientes
    ORDER  BY id_cliente DESC
");
$stmt->execute();

responder(true, 'OK', $stmt->fetchAll());
