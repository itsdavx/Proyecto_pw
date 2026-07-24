<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/facturacion/lib/Catalogos.php';
require_once __DIR__ . '/lib/MovimientoInventario.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame3', 'crear');

$codigo       = trim($input['codigo_principal'] ?? '');
$descripcion  = trim($input['descripcion'] ?? '');
$precio       = (float)($input['precio_unitario'] ?? 0);
$codigoIva    = trim($input['codigo_porcentaje_iva'] ?? '');
$codigoIce    = trim($input['codigo_impuesto_especial'] ?? '');
$idCategoria  = (int)($input['id_categoria'] ?? 0);
$idUnidad     = (int)($input['id_unidad'] ?? 0);
$stock        = (float)($input['stock'] ?? 0);
$proveedor    = trim($input['proveedor'] ?? '');

if ($codigo === '')      responder(false, 'El código del producto es obligatorio.');
if ($descripcion === '') responder(false, 'La descripción es obligatoria.');
if ($precio <= 0)        responder(false, 'El precio unitario debe ser mayor a 0.');
if (!isset(Catalogos::IVA[$codigoIva])) responder(false, 'Código de IVA inválido.');
if ($codigoIce !== '' && !isset(Catalogos::IMPUESTO_ESPECIAL[$codigoIce])) responder(false, 'Impuesto especial inválido.');
if (!$idUnidad)           responder(false, 'La unidad de medida es obligatoria.');
if ($stock < 0)           responder(false, 'El stock no puede ser negativo.');

$db = getDB();
$db->beginTransaction();
try {
    $db->prepare("
        INSERT INTO productos (codigo_principal, descripcion, precio_unitario, codigo_porcentaje_iva,
                               codigo_impuesto_especial, id_categoria, id_unidad, stock, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ")->execute([
        $codigo, $descripcion, $precio, $codigoIva,
        $codigoIce !== '' ? $codigoIce : null,
        $idCategoria ?: null, $idUnidad, $stock, $sesion['id_user'],
    ]);
    $idProducto = (int)$db->lastInsertId();

    // La existencia inicial queda registrada como ingreso de inventario
    MovimientoInventario::registrar($db, [
        'id_producto'      => $idProducto,
        'codigo_principal' => $codigo,
        'descripcion'      => $descripcion,
        'unidad'           => MovimientoInventario::unidadDe($db, $idUnidad),
    ], 0, $stock, $sesion['id_user'], $proveedor !== '' ? $proveedor : null);

    $db->commit();
} catch (PDOException $e) {
    $db->rollBack();
    if ($e->getCode() === '23000') responder(false, 'Ya existe un producto con ese código, o la categoría/unidad no es válida.');
    throw $e;
}

responder(true, 'Producto creado correctamente.');
