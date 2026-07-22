<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/facturacion/lib/Catalogos.php';

$input  = getInput();
$token  = $input['token'] ?? '';
$sesion = verificarSesion($token);
verificarPermiso($sesion['id_rol'], 'frame4', 'editar');

$idCliente      = (int)($input['id_cliente'] ?? 0);
$tipo           = trim($input['tipo_identificacion'] ?? '');
$identificacion = trim($input['identificacion'] ?? '');
$razonSocial    = trim($input['razon_social'] ?? '');
$direccion      = trim($input['direccion'] ?? '');
$email          = trim($input['email'] ?? '');
$telefono       = trim($input['telefono'] ?? '');

if (!$idCliente) responder(false, 'ID de cliente requerido.');
if (!isset(Catalogos::TIPO_IDENTIFICACION[$tipo])) responder(false, 'Tipo de identificación inválido.');
if ($razonSocial === '') responder(false, 'La razón social / nombre es obligatorio.');
if ($identificacion === '') responder(false, 'La identificación es obligatoria.');

$longitud = Catalogos::LONGITUD_IDENTIFICACION[$tipo] ?? null;
if ($longitud !== null && strlen($identificacion) !== $longitud) {
    responder(false, "La identificación de este tipo debe tener {$longitud} dígitos.");
}

$db = getDB();
try {
    $db->prepare("
        UPDATE clientes
        SET    tipo_identificacion = ?, identificacion = ?, razon_social = ?, direccion = ?, email = ?, telefono = ?
        WHERE  id_cliente = ?
    ")->execute([
        $tipo, $identificacion, $razonSocial,
        $direccion !== '' ? $direccion : null,
        $email     !== '' ? $email     : null,
        $telefono  !== '' ? $telefono  : null,
        $idCliente,
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder(false, 'Ya existe otro cliente con esa identificación.');
    }
    throw $e;
}

responder(true, 'Cliente actualizado correctamente.');
