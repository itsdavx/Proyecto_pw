<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/facturacion/lib/Catalogos.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame4', 'eliminar');

$idCliente = (int)($input['id_cliente'] ?? 0);
if (!$idCliente) responder(false, 'ID de cliente requerido.');

$db = getDB();

$cliente = $db->prepare("SELECT * FROM clientes WHERE id_cliente = ?");
$cliente->execute([$idCliente]);
$cliente = $cliente->fetch();
if (!$cliente) responder(false, 'Cliente no encontrado.');

// Consumidor Final es obligatorio para el módulo y no puede eliminarse
if ($cliente['tipo_identificacion'] === '07' && $cliente['identificacion'] === Catalogos::CONSUMIDOR_FINAL_ID) {
    responder(false, 'El cliente Consumidor Final es obligatorio y no puede eliminarse.');
}

// Un cliente con facturas emitidas no se elimina: las facturas son
// historial contable inmutable y lo referencian (FK RESTRICT).
$stmt = $db->prepare("SELECT COUNT(*) AS total FROM facturas WHERE id_cliente = ?");
$stmt->execute([$idCliente]);
$facturas = (int)$stmt->fetch()['total'];
if ($facturas > 0) {
    responder(false, "No se puede eliminar: el cliente tiene {$facturas} factura(s) emitida(s). Puede desactivarlo en su lugar.");
}

$db->prepare("DELETE FROM clientes WHERE id_cliente = ?")->execute([$idCliente]);

responder(true, 'Cliente eliminado correctamente.');
