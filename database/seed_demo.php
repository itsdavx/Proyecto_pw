<?php
/**
 * =====================================================================
 * SEED DE DATOS DEMOSTRATIVOS — Módulo de Facturación
 * =====================================================================
 * Genera un conjunto de datos realista y coherente para un entorno de
 * demostración/desarrollo: clientes, catálogo de productos (inventario),
 * roles con permisos de mínimo privilegio, un usuario por rol y ~5
 * facturas reales (con clave de acceso, XML y descuento de stock),
 * cuyas salidas alimentan automáticamente el módulo de Movimientos.
 *
 * Es IDEMPOTENTE: al re-ejecutarse limpia los datos demostrativos
 * previos (facturas, clientes salvo Consumidor Final, productos, y los
 * roles/usuarios demo) antes de volver a insertarlos. NO toca la
 * estructura, el usuario Administrador, el rol Vendedor ni la
 * configuración de menús.
 *
 * Uso (CLI):  php database/seed_demo.php
 *
 * Reutiliza las mismas clases de servidor/facturacion/lib que el
 * endpoint de emisión, de modo que cada factura es idéntica a una
 * generada por la aplicación.
 * =====================================================================
 */

// --- Conexión propia (CLI): espeja las credenciales de servidor/config.php ---
const DB_HOST = 'localhost';
const DB_PORT = '3306';
const DB_NAME = 'proyecto_pw';
const DB_USER = 'root';
const DB_PASS = 'rootroot';

$LIB = __DIR__ . '/../servidor/facturacion/lib';
require_once $LIB . '/Catalogos.php';
require_once $LIB . '/CalculadoraFactura.php';
require_once $LIB . '/ClaveAcceso.php';
require_once $LIB . '/FacturaXmlBuilder.php';
require_once $LIB . '/ValidadorFactura.php';
require_once __DIR__ . '/../servidor/menu/semilla.php';

function salir(string $msg): void { fwrite(STDERR, "ERROR: $msg\n"); exit(1); }

try {
    $db = new PDO(
        sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8', DB_HOST, DB_PORT, DB_NAME),
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
    );
} catch (PDOException $e) {
    salir('Conexión: ' . $e->getMessage());
}

/* Contraseña de prueba común para los usuarios demo (desarrollo). */
const PASSWORD_DEMO = 'Demo2026$';

/* ---------------------------------------------------------------------
 * Datos base
 * ------------------------------------------------------------------- */

// Emisor: empresa emisora realista (datos sintéticos, ambiente Pruebas).
$EMISOR = [
    'ruc'                    => '1791745823001',
    'razon_social'           => 'DISTRIBUIDORA COMERCIAL NEXUS S.A.',
    'nombre_comercial'       => 'NEXUS Distribuciones',
    'dir_matriz'             => 'Av. República del Salvador N36-84 y Naciones Unidas, Quito',
    'ambiente'               => '1',
    'tipo_emision'           => '1',
    'establecimiento'        => '001',
    'punto_emision'          => '001',
    'obligado_contabilidad'  => 'SI',
    'contribuyente_especial' => null,
];

// Clientes (identificaciones sintéticas con formato válido: RUC 13, cédula 10).
$CLIENTES = [
    ['04', '0992765431001', 'IMPORTADORA COMERCIAL ANDINA S.A.',              'Av. Francisco de Orellana y Alberto Borges, Edif. Centrum, Guayaquil', 'compras@comercialandina.com.ec', '042683450'],
    ['04', '1791234560001', 'FERRETERÍA Y ACABADOS EL CONSTRUCTOR CÍA. LTDA.', 'Av. Maldonado S12-345 y Alonso de Angulo, Quito',                     'ventas@elconstructor.ec',        '023456712'],
    ['04', '1890345671001', 'TECNOSOLUCIONES DEL AUSTRO S.A.',                 'Av. Remigio Crespo 4-56 y Guayas, Cuenca',                            'info@tecnosoluciones.com.ec',    '074082310'],
    ['04', '0993018745001', 'DISTRIBUIDORA DE ALIMENTOS LA PRADERA S.A.',      'Km 8.5 Vía Daule, Parque Industrial Pascuales, Guayaquil',            'pedidos@lapradera.com.ec',       '046002145'],
    ['05', '1710345678',    'María Fernanda Cevallos Torres',                  'Calle Los Ríos N24-12 y Foch, Quito',                                 'mariaf.cevallos@gmail.com',      '0991234576'],
    ['05', '0918273645',    'Juan Carlos Paredes Molina',                      'Cdla. Kennedy Norte, Calle San Roque 210, Guayaquil',                 'jc.paredes@hotmail.com',         '0987651234'],
    ['05', '0104567823',    'Andrea Estefanía Vaca Naranjo',                   'Av. Solano 3-45 y Federico Malo, Cuenca',                             'andrea.vaca@outlook.com',        '0995847612'],
    ['05', '1312045678',    'Diego Armando Suárez Herrera',                    'Av. 4 de Noviembre y Malecón, Manta',                                 'diego.suarez@yahoo.es',          '0968473921'],
];

// Productos (categorías 1-8, unidades 1-10 según la BD; IVA: '4'=15%, '0'=0%).
// [codigo, descripcion, precio, id_categoria, id_unidad, iva, stock]
$PRODUCTOS = [
    ['LIMP-001', 'Desinfectante Multiusos Lavanda 1 L',        2.85,  1, 5,  '4', 140],
    ['LIMP-002', 'Detergente en Polvo Multiusos 5 Kg',         8.90,  1, 1,  '4',  80],
    ['LIMP-003', 'Jabón Líquido Antibacterial 500 mL',         1.95,  1, 6,  '4', 210],
    ['BEB-001',  'Agua Mineral sin Gas 500 mL',                0.65,  3, 10, '0', 480],
    ['BEB-002',  'Gaseosa Cola 1.5 L',                         1.40,  3, 10, '4', 300],
    ['BEB-003',  'Café Molido Tostado 500 g',                  4.75,  3, 8,  '4',  95],
    ['ALI-001',  'Arroz Flor Grano Largo 2 Kg',                2.35,  2, 1,  '0', 160],
    ['ALI-002',  'Aceite Vegetal de Girasol 1 L',              2.90,  2, 5,  '0', 120],
    ['ALI-003',  'Atún Lomo en Aceite 170 g',                  1.55,  2, 7,  '0', 260],
    ['TEC-001',  'Mouse Óptico Inalámbrico USB',               8.50,  4, 7,  '4',  55],
    ['TEC-002',  'Teclado Multimedia USB Español',            12.90,  4, 7,  '4',  38],
    ['TEC-003',  'Memoria Flash USB 32 GB',                    6.75,  4, 7,  '4',  90],
    ['PAP-001',  'Resma Papel Bond A4 75 g (500 hojas)',       3.80,  5, 8,  '4', 220],
    ['PAP-002',  'Esferográfico Punta Fina Azul (caja x12)',   4.20,  5, 9,  '4',  70],
    ['PAP-003',  'Cuaderno Universitario 100 Hojas',           1.85,  5, 7,  '4', 150],
    ['HOG-001',  'Foco LED 9W Luz Blanca E27',                 1.75,  6, 7,  '4', 200],
];

// Roles (nombre, descripción) y sus permisos (mínimo privilegio).
// Baseline común: dashboard, perfil y menú personal (no administrativo).
$BASE = [
    ['dashboard','leer'], ['perfil','leer'], ['perfil','editar'],
    ['menu','leer'], ['menu','crear'], ['menu','renombrar'], ['menu','eliminar'], ['menu','reordenar'],
];
$ROLES = [
    'Supervisor' => [
        'desc' => 'Supervisión general: facturación, inventario, clientes y administración de usuarios y roles.',
        'perms' => array_merge($BASE, [
            ['frame1','leer'],
            ['frame2','leer'], ['frame2','crear'], ['frame2','editar'],
            ['frame3','leer'], ['frame3','crear'], ['frame3','editar'], ['frame3','estado'], ['frame3','eliminar'],
            ['frame4','leer'], ['frame4','crear'], ['frame4','editar'], ['frame4','estado'], ['frame4','eliminar'],
            ['usuarios','leer'], ['usuarios','crear'], ['usuarios','editar'], ['usuarios','desactivar'], ['usuarios','cambiar_rol'],
            ['roles','leer'], ['roles','crear'], ['roles','editar'], ['roles','eliminar'],
            ['permisos','leer'], ['permisos','crear'],
        ]),
    ],
    'Facturador' => [
        'desc' => 'Emisión y consulta de facturas; consulta de clientes e inventario. Sin permisos administrativos.',
        'perms' => array_merge($BASE, [
            ['frame2','leer'], ['frame2','crear'],
            ['frame3','leer'],
            ['frame4','leer'],
        ]),
    ],
    'Auxiliar de Cobranza' => [
        'desc' => 'Consulta de facturas, clientes y estados de pago para la gestión de cobranza. Sin acceso a inventario ni configuración.',
        'perms' => array_merge($BASE, [
            ['frame1','leer'],
            ['frame2','leer'],
            ['frame4','leer'],
        ]),
    ],
    'Analista de Facturación' => [
        'desc' => 'Consulta de facturas, movimientos e inventario para análisis y reportes. Solo lectura, sin modificaciones administrativas.',
        'perms' => array_merge($BASE, [
            ['frame1','leer'],
            ['frame2','leer'],
            ['frame3','leer'],
            ['frame4','leer'],
        ]),
    ],
];

// Usuarios demo (uno por rol). Todos con la misma contraseña de desarrollo.
$USUARIOS = [
    ['Supervisor',              'rmora',    'Ricardo Andrés Mora Villavicencio', 'ricardo.mora@nexusdist.ec'],
    ['Facturador',              'gsalazar', 'Gabriela Estefanía Salazar Ponce',  'gabriela.salazar@nexusdist.ec'],
    ['Auxiliar de Cobranza',    'lnaranjo', 'Luis Fernando Naranjo Espín',       'luis.naranjo@nexusdist.ec'],
    ['Analista de Facturación', 'pjimenez', 'Paola Cristina Jiménez Andrade',    'paola.jimenez@nexusdist.ec'],
];

/* ---------------------------------------------------------------------
 * Helper: generar una factura idéntica a la del endpoint de emisión.
 * ------------------------------------------------------------------- */
function crearFacturaDemo(PDO $db, array $emisor, int $idCliente, array $items, string $formaPago, float $propina, string $fecha, int $createdBy): array
{
    $cliente = $db->prepare("SELECT * FROM clientes WHERE id_cliente = ?");
    $cliente->execute([$idCliente]);
    $cliente = $cliente->fetch();
    if (!$cliente) throw new RuntimeException("Cliente $idCliente no existe.");

    $lineas = [];
    foreach ($items as $it) {
        $prod = $db->prepare("SELECT p.*, u.abreviatura AS unidad FROM productos p INNER JOIN unidades_medida u ON u.id_unidad = p.id_unidad WHERE p.codigo_principal = ? AND p.estado = 1");
        $prod->execute([$it['codigo']]);
        $prod = $prod->fetch();
        if (!$prod) throw new RuntimeException("Producto {$it['codigo']} no existe.");

        $cantidad = (float)$it['cantidad'];
        $subtotalLinea = round($cantidad * (float)$prod['precio_unitario'], 2);
        $descuento     = round($subtotalLinea * (float)$it['descuento_pct'] / 100, 2);

        $calculo = CalculadoraFactura::calcularLinea($cantidad, (float)$prod['precio_unitario'], $descuento, $prod['codigo_porcentaje_iva']);
        $lineas[] = array_merge($calculo, [
            'id_producto'      => $prod['id_producto'],
            'codigo_principal' => $prod['codigo_principal'],
            'descripcion'      => $prod['descripcion'],
            'cantidad'         => $cantidad,
            'unidad'           => $prod['unidad'],
            'precio_unitario'  => (float)$prod['precio_unitario'],
            'descuento'        => $descuento,
        ]);
    }

    $totales = CalculadoraFactura::calcularTotales($lineas);
    $totales['propina']       = $propina;
    $totales['importe_total'] = round($totales['importe_total'] + $propina, 2);

    $stmt = $db->prepare("SELECT COALESCE(MAX(CAST(secuencial AS UNSIGNED)),0)+1 AS s FROM facturas WHERE establecimiento = ? AND punto_emision = ?");
    $stmt->execute([$emisor['establecimiento'], $emisor['punto_emision']]);
    $secuencial = str_pad((string)$stmt->fetch()['s'], 9, '0', STR_PAD_LEFT);

    $codigoNumerico = ClaveAcceso::generarCodigoNumerico();
    $claveAcceso = ClaveAcceso::generar($fecha, $emisor['ruc'], $emisor['ambiente'], $emisor['establecimiento'], $emisor['punto_emision'], $secuencial, $codigoNumerico, $emisor['tipo_emision']);

    $facturaDatos = array_merge([
        'ambiente' => $emisor['ambiente'], 'tipo_emision' => $emisor['tipo_emision'],
        'establecimiento' => $emisor['establecimiento'], 'punto_emision' => $emisor['punto_emision'],
        'secuencial' => $secuencial, 'clave_acceso' => $claveAcceso, 'fecha_emision' => $fecha,
        'tipo_identificacion_comprador' => $cliente['tipo_identificacion'],
        'identificacion_comprador' => $cliente['identificacion'],
        'razon_social_comprador' => $cliente['razon_social'],
        'direccion_comprador' => $cliente['direccion'], 'forma_pago' => $formaPago,
    ], $totales);

    $xmlDoc  = FacturaXmlBuilder::construir($emisor, $facturaDatos, $lineas);
    $errores = ValidadorFactura::validar($xmlDoc);
    if ($errores) throw new RuntimeException('XML inválido: ' . implode(' | ', $errores));
    $xml = $xmlDoc->saveXML();

    // Salida de inventario (misma condición atómica que el endpoint)
    $stmtStock = $db->prepare("UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?");
    foreach ($lineas as $l) {
        $stmtStock->execute([$l['cantidad'], $l['id_producto'], $l['cantidad']]);
        if ($stmtStock->rowCount() === 0) throw new RuntimeException("Stock insuficiente de {$l['descripcion']}.");
    }

    $db->prepare("
        INSERT INTO facturas (ambiente, tipo_emision, establecimiento, punto_emision, secuencial, codigo_numerico, clave_acceso,
            fecha_emision, id_cliente, tipo_identificacion_comprador, identificacion_comprador, razon_social_comprador,
            direccion_comprador, forma_pago, total_sin_impuestos, total_descuento, total_iva, propina, importe_total,
            xml_generado, created_by, created_at)
        VALUES (?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?,?, ?,?, ?)
    ")->execute([
        $emisor['ambiente'], $emisor['tipo_emision'], $emisor['establecimiento'], $emisor['punto_emision'],
        $secuencial, $codigoNumerico, $claveAcceso, $fecha, $idCliente,
        $cliente['tipo_identificacion'], $cliente['identificacion'], $cliente['razon_social'], $cliente['direccion'],
        $formaPago, $totales['total_sin_impuestos'], $totales['total_descuento'], $totales['total_iva'],
        $totales['propina'], $totales['importe_total'], $xml, $createdBy, $fecha . ' 10:' . str_pad((string)random_int(5,55),2,'0',STR_PAD_LEFT) . ':00',
    ]);
    $idFactura = (int)$db->lastInsertId();

    $stmtDet = $db->prepare("
        INSERT INTO factura_detalle (id_factura, id_producto, codigo_principal, descripcion, cantidad, unidad, precio_unitario, descuento,
            precio_total_sin_impuesto, codigo_porcentaje_iva, tarifa_iva, base_imponible_iva, valor_iva)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    foreach ($lineas as $l) {
        $stmtDet->execute([
            $idFactura, $l['id_producto'], $l['codigo_principal'], $l['descripcion'], $l['cantidad'], $l['unidad'],
            $l['precio_unitario'], $l['descuento'], $l['precio_total_sin_impuesto'],
            $l['codigo_porcentaje_iva'], $l['tarifa_iva'], $l['base_imponible_iva'], $l['valor_iva'],
        ]);
    }
    return ['id' => $idFactura, 'secuencial' => $secuencial, 'total' => $totales['importe_total']];
}

/* ---------------------------------------------------------------------
 * Ejecución
 * ------------------------------------------------------------------- */
$db->beginTransaction();
try {
    // 1) Emisor realista (configuración, no se elimina: se actualiza)
    $db->prepare("UPDATE factura_emisor SET ruc=?, razon_social=?, nombre_comercial=?, dir_matriz=?, ambiente=?, tipo_emision=?, establecimiento=?, punto_emision=?, obligado_contabilidad=?, contribuyente_especial=? WHERE id_emisor=1")
       ->execute([$EMISOR['ruc'], $EMISOR['razon_social'], $EMISOR['nombre_comercial'], $EMISOR['dir_matriz'], $EMISOR['ambiente'], $EMISOR['tipo_emision'], $EMISOR['establecimiento'], $EMISOR['punto_emision'], $EMISOR['obligado_contabilidad'], $EMISOR['contribuyente_especial']]);

    // 2) Limpieza idempotente de datos demostrativos previos
    $db->exec("DELETE FROM factura_detalle");
    $db->exec("DELETE FROM facturas");
    $db->exec("DELETE FROM clientes WHERE NOT (tipo_identificacion='07' AND identificacion='9999999999999')");
    $db->exec("DELETE FROM productos");

    $nombresDemo = array_keys($ROLES);
    $ph = implode(',', array_fill(0, count($nombresDemo), '?'));
    $rolesPrevios = $db->prepare("SELECT id_rol FROM roles WHERE nombre_rol IN ($ph)");
    $rolesPrevios->execute($nombresDemo);
    $idsRolesDemo = array_column($rolesPrevios->fetchAll(), 'id_rol');
    if ($idsRolesDemo) {
        $phr = implode(',', array_fill(0, count($idsRolesDemo), '?'));
        $usuariosDemo = $db->prepare("SELECT id_user FROM pw_user WHERE id_rol IN ($phr)");
        $usuariosDemo->execute($idsRolesDemo);
        foreach (array_column($usuariosDemo->fetchAll(), 'id_user') as $uid) {
            foreach (['sesiones','accesos_ocultos_usuario','menu_orden_usuario','menu_super_usuario'] as $t) {
                $db->prepare("DELETE FROM $t WHERE id_user = ?")->execute([$uid]);
            }
            $db->prepare("DELETE FROM pw_user WHERE id_user = ?")->execute([$uid]);
        }
        // permisos_rol se elimina en cascada al borrar el rol
        $db->prepare("DELETE FROM roles WHERE id_rol IN ($phr)")->execute($idsRolesDemo);
    }

    // 3) Clientes
    $insCli = $db->prepare("INSERT INTO clientes (tipo_identificacion, identificacion, razon_social, direccion, email, telefono, estado, created_by) VALUES (?,?,?,?,?,?,1,1)");
    $idsClientes = [];
    foreach ($CLIENTES as $c) {
        $insCli->execute([$c[0], $c[1], $c[2], $c[3], $c[4], $c[5]]);
        $idsClientes[$c[1]] = (int)$db->lastInsertId();
    }

    // 4) Productos (inventario con stock)
    $insProd = $db->prepare("INSERT INTO productos (codigo_principal, descripcion, precio_unitario, codigo_porcentaje_iva, id_categoria, id_unidad, stock, estado, created_by) VALUES (?,?,?,?,?,?,?,1,1)");
    foreach ($PRODUCTOS as $p) {
        $insProd->execute([$p[0], $p[1], $p[2], $p[5], $p[3], $p[4], $p[6]]);
    }

    // 5) Roles + permisos
    $insRol  = $db->prepare("INSERT INTO roles (nombre_rol, descripcion, estado) VALUES (?, ?, 1)");
    $insPerm = $db->prepare("INSERT INTO permisos_rol (id_rol, modulo, accion) VALUES (?, ?, ?)");
    $idsRoles = [];
    foreach ($ROLES as $nombre => $def) {
        $insRol->execute([$nombre, $def['desc']]);
        $idRol = (int)$db->lastInsertId();
        $idsRoles[$nombre] = $idRol;
        foreach ($def['perms'] as $pm) {
            $insPerm->execute([$idRol, $pm[0], $pm[1]]);
        }
    }

    // 6) Usuarios (uno por rol) + siembra de su menú personal
    $hash = password_hash(PASSWORD_DEMO, PASSWORD_BCRYPT, ['cost' => 12]);
    $insUser = $db->prepare("INSERT INTO pw_user (username, password, nombre, email, id_rol, estado, primer_login, created_by) VALUES (?, ?, ?, ?, ?, 1, 0, 1)");
    $idsUsuarios = [];
    foreach ($USUARIOS as $u) {
        $insUser->execute([$u[1], $hash, $u[2], $u[3], $idsRoles[$u[0]]]);
        $uid = (int)$db->lastInsertId();
        $idsUsuarios[$u[0]] = $uid;
        sembrarMenuInicial($db, $uid, $idsRoles[$u[0]]);
    }

    // 7) Facturas (orden cronológico → secuenciales 1..N), emitidas por
    //    el Facturador y el Supervisor para dar coherencia de usuario.
    $facturador = $idsUsuarios['Facturador'];
    $supervisor = $idsUsuarios['Supervisor'];
    $FACTURAS = [
        ['2026-06-12', '0992765431001', '20', 0.00, $facturador, [['codigo'=>'TEC-001','cantidad'=>5,'descuento_pct'=>0], ['codigo'=>'TEC-003','cantidad'=>10,'descuento_pct'=>5]]],
        ['2026-06-25', '1710345678',    '19', 0.00, $facturador, [['codigo'=>'LIMP-001','cantidad'=>3,'descuento_pct'=>0], ['codigo'=>'BEB-002','cantidad'=>6,'descuento_pct'=>0], ['codigo'=>'ALI-001','cantidad'=>2,'descuento_pct'=>0]]],
        ['2026-07-03', '1791234560001', '01', 0.00, $supervisor, [['codigo'=>'PAP-001','cantidad'=>10,'descuento_pct'=>0], ['codigo'=>'PAP-002','cantidad'=>5,'descuento_pct'=>0], ['codigo'=>'HOG-001','cantidad'=>20,'descuento_pct'=>10]]],
        ['2026-07-15', '0918273645',    '16', 0.00, $facturador, [['codigo'=>'BEB-001','cantidad'=>24,'descuento_pct'=>0], ['codigo'=>'ALI-003','cantidad'=>12,'descuento_pct'=>0], ['codigo'=>'ALI-002','cantidad'=>4,'descuento_pct'=>0]]],
        ['2026-07-21', '1890345671001', '20', 0.00, $supervisor, [['codigo'=>'TEC-002','cantidad'=>8,'descuento_pct'=>0], ['codigo'=>'TEC-001','cantidad'=>6,'descuento_pct'=>5]]],
    ];
    $emisorRow = $db->query("SELECT * FROM factura_emisor WHERE id_emisor = 1")->fetch();
    $resFacturas = [];
    foreach ($FACTURAS as $f) {
        $resFacturas[] = crearFacturaDemo($db, $emisorRow, $idsClientes[$f[1]], $f[5], $f[2], $f[3], $f[0], $f[4]);
    }

    $db->commit();

    // Resumen
    echo "== Seed de datos demostrativos completado ==\n";
    echo "Clientes insertados:  " . count($CLIENTES) . " (+ Consumidor Final)\n";
    echo "Productos insertados: " . count($PRODUCTOS) . "\n";
    echo "Roles creados:        " . implode(', ', array_keys($idsRoles)) . "\n";
    foreach ($USUARIOS as $u) echo "  usuario '{$u[1]}' → rol {$u[0]}\n";
    echo "Contraseña demo (todos): " . PASSWORD_DEMO . "\n";
    echo "Facturas generadas:\n";
    foreach ($resFacturas as $rf) echo "  #{$rf['secuencial']}  total \${$rf['total']}\n";
} catch (Throwable $e) {
    $db->rollBack();
    salir($e->getMessage());
}
