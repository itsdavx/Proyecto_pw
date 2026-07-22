<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame3', 'eliminar');

$idProducto = (int)($input['id_producto'] ?? 0);
if (!$idProducto) responder(false, 'ID de producto requerido.');

$db = getDB();

$producto = $db->prepare("SELECT * FROM productos WHERE id_producto = ?");
$producto->execute([$idProducto]);
$producto = $producto->fetch();
if (!$producto) responder(false, 'Producto no encontrado.');

// El historial de facturas no se altera: factura_detalle guarda una
// instantánea (código, descripción, unidad, precios) y su FK es
// ON DELETE SET NULL, por lo que eliminar el producto no lo afecta.
$db->prepare("DELETE FROM productos WHERE id_producto = ?")->execute([$idProducto]);

responder(true, 'Producto eliminado correctamente. Las facturas emitidas conservan su detalle histórico.');
