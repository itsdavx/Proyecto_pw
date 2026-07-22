<?php
require_once dirname(__DIR__) . '/config.php';
require_once __DIR__ . '/lib/Catalogos.php';
require_once __DIR__ . '/lib/CalculadoraFactura.php';
require_once __DIR__ . '/lib/ClaveAcceso.php';
require_once __DIR__ . '/lib/FacturaXmlBuilder.php';
require_once __DIR__ . '/lib/ValidadorFactura.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame2', 'crear');

$idCliente = (int)($input['id_cliente'] ?? 0);
$items     = $input['items'] ?? [];
$formaPago = trim($input['forma_pago'] ?? '01');
$propina   = round((float)($input['propina'] ?? 0), 2);

if (!$idCliente)                               responder(false, 'Debe seleccionar un cliente.');
if (!is_array($items) || count($items) === 0)  responder(false, 'Debe agregar al menos un ítem al detalle.');
if (!isset(Catalogos::FORMA_PAGO[$formaPago]))  responder(false, 'Forma de pago inválida.');
if ($propina < 0)                              responder(false, 'La propina no puede ser negativa.');

$db = getDB();

$cliente = $db->prepare("SELECT * FROM clientes WHERE id_cliente = ? AND estado = 1");
$cliente->execute([$idCliente]);
$cliente = $cliente->fetch();
if (!$cliente) responder(false, 'Cliente no encontrado o inactivo.');

$emisor = $db->query("SELECT * FROM factura_emisor WHERE id_emisor = 1")->fetch();
if (!$emisor) responder(false, 'Debe configurar los datos del emisor antes de generar facturas.');

// ---- Construir y calcular las líneas de detalle ----
$lineas = [];
foreach ($items as $it) {
    $idProducto   = (int)($it['id_producto'] ?? 0);
    $cantidad     = (float)($it['cantidad'] ?? 0);
    $descuentoPct = round((float)($it['descuento_pct'] ?? 0), 2);

    if ($cantidad <= 0) responder(false, 'La cantidad de cada ítem debe ser mayor a 0.');
    if ($descuentoPct < 0 || $descuentoPct > 100) {
        responder(false, 'El descuento de cada ítem debe ser un porcentaje entre 0 y 100.');
    }

    $producto = $db->prepare("
        SELECT p.*, u.abreviatura AS unidad
        FROM   productos p
        INNER  JOIN unidades_medida u ON u.id_unidad = p.id_unidad
        WHERE  p.id_producto = ? AND p.estado = 1
    ");
    $producto->execute([$idProducto]);
    $producto = $producto->fetch();
    if (!$producto) responder(false, 'Uno de los productos no existe o está inactivo.');

    // El porcentaje se convierte al valor monetario que exige el esquema
    // del SRI (<descuento>); al estar acotado a 0-100 nunca supera el
    // subtotal de la línea.
    $subtotalLinea = round($cantidad * (float)$producto['precio_unitario'], 2);
    $descuento     = round($subtotalLinea * $descuentoPct / 100, 2);

    $calculo = CalculadoraFactura::calcularLinea(
        $cantidad, (float)$producto['precio_unitario'], $descuento, $producto['codigo_porcentaje_iva']
    );

    $lineas[] = array_merge($calculo, [
        'id_producto'      => $producto['id_producto'],
        'codigo_principal' => $producto['codigo_principal'],
        'descripcion'      => $producto['descripcion'],
        'cantidad'         => $cantidad,
        'unidad'           => $producto['unidad'],
        'precio_unitario'  => (float)$producto['precio_unitario'],
        'descuento'        => $descuento,
    ]);
}

$totales             = CalculadoraFactura::calcularTotales($lineas);
$totales['propina']  = $propina;
$totales['importe_total'] = round($totales['importe_total'] + $propina, 2);

// ---- Secuencial: siguiente consecutivo por establecimiento + punto de emisión ----
$stmt = $db->prepare("
    SELECT COALESCE(MAX(CAST(secuencial AS UNSIGNED)), 0) + 1 AS siguiente
    FROM   facturas WHERE establecimiento = ? AND punto_emision = ?
");
$stmt->execute([$emisor['establecimiento'], $emisor['punto_emision']]);
$secuencial = str_pad((string)$stmt->fetch()['siguiente'], 9, '0', STR_PAD_LEFT);

$fechaEmision   = date('Y-m-d');
$codigoNumerico = ClaveAcceso::generarCodigoNumerico();
$claveAcceso    = ClaveAcceso::generar(
    $fechaEmision, $emisor['ruc'], $emisor['ambiente'],
    $emisor['establecimiento'], $emisor['punto_emision'],
    $secuencial, $codigoNumerico, $emisor['tipo_emision']
);

$facturaDatos = array_merge([
    'ambiente'                      => $emisor['ambiente'],
    'tipo_emision'                  => $emisor['tipo_emision'],
    'establecimiento'               => $emisor['establecimiento'],
    'punto_emision'                 => $emisor['punto_emision'],
    'secuencial'                    => $secuencial,
    'clave_acceso'                  => $claveAcceso,
    'fecha_emision'                 => $fechaEmision,
    'tipo_identificacion_comprador' => $cliente['tipo_identificacion'],
    'identificacion_comprador'      => $cliente['identificacion'],
    'razon_social_comprador'        => $cliente['razon_social'],
    'direccion_comprador'           => $cliente['direccion'],
    'forma_pago'                    => $formaPago,
], $totales);

$xmlDoc  = FacturaXmlBuilder::construir($emisor, $facturaDatos, $lineas);
$errores = ValidadorFactura::validar($xmlDoc);
if ($errores) {
    responder(false, 'El XML generado no cumple el esquema: ' . implode(' | ', $errores));
}
$xml = $xmlDoc->saveXML();

// ---- Persistir factura + detalle, descontando stock ----
$db->beginTransaction();
try {
    // Salida de inventario: el descuento condicionado (stock >= cantidad)
    // es atómico y acumula correctamente líneas repetidas del mismo producto.
    $stmtStock = $db->prepare("UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?");
    foreach ($lineas as $l) {
        $stmtStock->execute([$l['cantidad'], $l['id_producto'], $l['cantidad']]);
        if ($stmtStock->rowCount() === 0) {
            $db->rollBack();
            responder(false, "Stock insuficiente de \"{$l['descripcion']}\". Revise el inventario.");
        }
    }

    $db->prepare("
        INSERT INTO facturas (
            ambiente, tipo_emision, establecimiento, punto_emision, secuencial, codigo_numerico, clave_acceso,
            fecha_emision, id_cliente, tipo_identificacion_comprador, identificacion_comprador, razon_social_comprador,
            direccion_comprador, forma_pago, total_sin_impuestos, total_descuento, total_iva, propina, importe_total,
            xml_generado, created_by
        ) VALUES (?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?,?, ?,?)
    ")->execute([
        $emisor['ambiente'], $emisor['tipo_emision'], $emisor['establecimiento'], $emisor['punto_emision'],
        $secuencial, $codigoNumerico, $claveAcceso,
        $fechaEmision, $idCliente, $cliente['tipo_identificacion'], $cliente['identificacion'], $cliente['razon_social'],
        $cliente['direccion'], $formaPago, $totales['total_sin_impuestos'], $totales['total_descuento'],
        $totales['total_iva'], $totales['propina'], $totales['importe_total'],
        $xml, $sesion['id_user'],
    ]);
    $idFactura = (int)$db->lastInsertId();

    $stmtDet = $db->prepare("
        INSERT INTO factura_detalle (
            id_factura, id_producto, codigo_principal, descripcion, cantidad, unidad, precio_unitario, descuento,
            precio_total_sin_impuesto, codigo_porcentaje_iva, tarifa_iva, base_imponible_iva, valor_iva
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    foreach ($lineas as $l) {
        $stmtDet->execute([
            $idFactura, $l['id_producto'], $l['codigo_principal'], $l['descripcion'], $l['cantidad'], $l['unidad'],
            $l['precio_unitario'], $l['descuento'], $l['precio_total_sin_impuesto'],
            $l['codigo_porcentaje_iva'], $l['tarifa_iva'], $l['base_imponible_iva'], $l['valor_iva'],
        ]);
    }

    $db->commit();
} catch (\Throwable $e) {
    $db->rollBack();
    responder(false, 'Error al guardar la factura: ' . $e->getMessage());
}

responder(true, 'Factura generada correctamente.', ['id_factura' => $idFactura, 'clave_acceso' => $claveAcceso]);
