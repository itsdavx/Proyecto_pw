<?php
require_once dirname(__DIR__) . '/config.php';

$input    = getInput();
$username = trim($input['username'] ?? '');
$password = $input['password']     ?? '';
$ip       = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

if (empty($username) || empty($password)) {
    responder(false, 'Usuario y contrasena son obligatorios.');
}

$db = getDB();

// ── Verificar bloqueo por brute-force ────────────────────────
$stmt = $db->prepare("SELECT intentos, bloqueado, ultimo_intento FROM login_intentos WHERE username = ? AND ip = ?");
$stmt->execute([$username, $ip]);
$intento = $stmt->fetch();

if ($intento && $intento['bloqueado']) {
    $segundos = time() - strtotime($intento['ultimo_intento']);
    if ($segundos < 900) {
        $minutos = ceil((900 - $segundos) / 60);
        responder(false, "Cuenta bloqueada. Intenta en $minutos minuto(s).");
    }
    $db->prepare("UPDATE login_intentos SET intentos = 0, bloqueado = 0 WHERE username = ? AND ip = ?")
       ->execute([$username, $ip]);
    $intento['intentos'] = 0;
}

// ── Buscar usuario ───────────────────────────────────────────
$stmt = $db->prepare("SELECT id_user, username, password, nombre, email, id_rol, estado, primer_login FROM pw_user WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

// ── Validar credenciales ─────────────────────────────────────
if (!$user || !password_verify($password, $user['password'])) {
    $intentos_nuevos = ($intento ? $intento['intentos'] : 0) + 1;
    $bloqueado       = $intentos_nuevos >= 5 ? 1 : 0;

    $db->prepare("
        INSERT INTO login_intentos (username, ip, intentos, bloqueado)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE intentos = ?, bloqueado = ?
    ")->execute([$username, $ip, $intentos_nuevos, $bloqueado, $intentos_nuevos, $bloqueado]);

    if ($bloqueado) {
        responder(false, 'Demasiados intentos fallidos. Cuenta bloqueada 15 minutos.');
    }
    $restantes = 5 - $intentos_nuevos;
    responder(false, "Usuario o contrasena incorrectos. Intentos restantes: $restantes");
}

if (!$user['estado']) {
    responder(false, 'Usuario inactivo. Contacta al administrador.');
}

// ── Login exitoso: limpiar intentos ──────────────────────────
$db->prepare("DELETE FROM login_intentos WHERE username = ? AND ip = ?")
   ->execute([$username, $ip]);

$db->prepare("DELETE FROM sesiones WHERE id_user = ?")
   ->execute([$user['id_user']]);

// ── Crear token de sesion ─────────────────────────────────────
$token  = bin2hex(random_bytes(32));
$expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

$db->prepare("INSERT INTO sesiones (token, id_user, ip, expires_at) VALUES (?, ?, ?, ?)")
   ->execute([$token, $user['id_user'], $ip, $expira]);

// ── Obtener permisos del rol ──────────────────────────────────
$stmt = $db->prepare("SELECT modulo, accion FROM permisos_rol WHERE id_rol = ?");
$stmt->execute([$user['id_rol']]);
$permisos = $stmt->fetchAll();

// ── Obtener nombre del rol ────────────────────────────────────
$stmt = $db->prepare("SELECT nombre_rol FROM roles WHERE id_rol = ?");
$stmt->execute([$user['id_rol']]);
$rol = $stmt->fetch();

// ── Respuesta esperada por session.js: {token, usuario:{}, permisos:[]} ──
responder(true, 'Login exitoso.', [
    'token'   => $token,
    'usuario' => [
        'id_user'     => (int)$user['id_user'],
        'username'    => $user['username'],
        'nombre'      => $user['nombre'],
        'email'       => $user['email'],
        'id_rol'      => (int)$user['id_rol'],
        'rol'         => $rol['nombre_rol'] ?? '',
        'primer_login'=> (int)$user['primer_login'],
    ],
    'permisos' => $permisos,
]);
