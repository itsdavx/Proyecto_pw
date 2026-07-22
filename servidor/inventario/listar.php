<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);

// El inventario es la fuente única de productos: alimenta tanto al
// módulo Inventario (frame3) como a Facturación (frame2, pestaña de
// productos y selector del detalle). Basta con poder leer uno de los
// dos módulos.
$puede = false;
foreach (['frame3', 'frame2'] as $mod) {
    if (moduloActivo($mod) && rolTienePermiso($sesion['id_rol'], $mod, 'leer')) {
        $puede = true;
        break;
    }
}
if (!$puede) responder(false, 'Sin permiso para esta accion.');

$db = getDB();

$productos = $db->query("
    SELECT p.id_producto, p.codigo_principal, p.descripcion, p.precio_unitario,
           p.codigo_porcentaje_iva, p.stock, p.estado,
           p.id_categoria, c.nombre AS categoria,
           p.id_unidad, u.nombre AS unidad, u.abreviatura AS unidad_abrev
    FROM   productos p
    LEFT   JOIN categorias c      ON c.id_categoria = p.id_categoria
    INNER  JOIN unidades_medida u ON u.id_unidad    = p.id_unidad
    ORDER  BY p.id_producto ASC
")->fetchAll();

$categorias = $db->query("
    SELECT id_categoria, nombre FROM categorias WHERE estado = 1 ORDER BY nombre ASC
")->fetchAll();

$unidades = $db->query("
    SELECT id_unidad, nombre, abreviatura FROM unidades_medida WHERE estado = 1 ORDER BY id_unidad ASC
")->fetchAll();

responder(true, 'OK', [
    'productos'  => $productos,
    'categorias' => $categorias,
    'unidades'   => $unidades,
]);
