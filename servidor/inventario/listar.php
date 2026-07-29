<?php
// Lista productos y catálogos
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

// Acceso desde dos módulos
$puede = false;
foreach (['frame3', 'frame2'] as $mod) {
    if (moduloActivo($mod) && rolTienePermiso($sesion['id_rol'], $mod, 'leer')) {
        $puede = true;
        break;
    }
}
if (!$puede) responder(false, 'Sin permiso para esta accion.');

$db = getDB();

$busqueda = trim((string)($input['busqueda'] ?? ''));
$limite   = isset($input['limite']) ? max(1, min(50, (int)$input['limite'])) : null;

$sql    = "SELECT p.id_producto, p.codigo_principal, p.descripcion, p.precio_unitario,
                  p.codigo_porcentaje_iva, p.codigo_impuesto_especial, p.stock, p.estado,
                  p.id_categoria, c.nombre AS categoria,
                  p.id_unidad, u.nombre AS unidad, u.abreviatura AS unidad_abrev
           FROM   productos p
           LEFT   JOIN categorias c      ON c.id_categoria = p.id_categoria
           INNER  JOIN unidades_medida u ON u.id_unidad    = p.id_unidad";
$params = [];

if ($busqueda !== '') {
    $comodin = '%' . $busqueda . '%';
    $sql    .= " WHERE (p.codigo_principal LIKE ? OR p.descripcion LIKE ?) ORDER BY p.descripcion ASC";
    $params  = [$comodin, $comodin];
} else {
    $sql .= " ORDER BY p.id_producto ASC";
}

if ($limite !== null) {
    $sql .= " LIMIT " . $limite;
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$productos = $stmt->fetchAll();

$categorias = [];
$unidades   = [];
if ($busqueda === '' && $limite === null) {
    $categorias = $db->query("
        SELECT id_categoria, nombre FROM categorias WHERE estado = 1 ORDER BY nombre ASC
    ")->fetchAll();

    $unidades = $db->query("
        SELECT id_unidad, nombre, abreviatura FROM unidades_medida WHERE estado = 1 ORDER BY id_unidad ASC
    ")->fetchAll();
}

responder(true, 'OK', [
    'productos'  => $productos,
    'categorias' => $categorias,
    'unidades'   => $unidades,
]);
