<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/facturacion/lib/Catalogos.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame3', 'editar');

$idProducto  = (int)($input['id_producto'] ?? 0);
$codigo      = trim($input['codigo_principal'] ?? '');
$descripcion = trim($input['descripcion'] ?? '');
$precio      = (float)($input['precio_unitario'] ?? 0);
$codigoIva   = trim($input['codigo_porcentaje_iva'] ?? '');
$idCategoria = (int)($input['id_categoria'] ?? 0);
$idUnidad    = (int)($input['id_unidad'] ?? 0);
$stock       = (float)($input['stock'] ?? 0);

if (!$idProducto)         responder(false, 'ID de producto requerido.');
if ($codigo === '')       responder(false, 'El código del producto es obligatorio.');
if ($descripcion === '')  responder(false, 'La descripción es obligatoria.');
if ($precio <= 0)         responder(false, 'El precio unitario debe ser mayor a 0.');
if (!isset(Catalogos::IVA[$codigoIva])) responder(false, 'Código de IVA inválido.');
if (!$idUnidad)           responder(false, 'La unidad de medida es obligatoria.');
if ($stock < 0)           responder(false, 'El stock no puede ser negativo.');

$db = getDB();
try {
    $db->prepare("
        UPDATE productos
        SET    codigo_principal = ?, descripcion = ?, precio_unitario = ?, codigo_porcentaje_iva = ?,
               id_categoria = ?, id_unidad = ?, stock = ?
        WHERE  id_producto = ?
    ")->execute([
        $codigo, $descripcion, $precio, $codigoIva,
        $idCategoria ?: null, $idUnidad, $stock, $idProducto,
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') responder(false, 'Ya existe otro producto con ese código, o la categoría/unidad no es válida.');
    throw $e;
}

responder(true, 'Producto actualizado correctamente.');
