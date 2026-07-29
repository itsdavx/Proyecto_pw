<?php
// Cabeceras JSON y CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

// Errores PHP como JSON
set_error_handler(function($errno, $errstr) {
    echo json_encode(['ok' => false, 'msg' => "Error PHP [$errno]: $errstr", 'data' => []]);
    exit;
});

// Credenciales de MySQL
define('DB_HOST',    'localhost');
define('DB_PORT',    '3306');
define('DB_NAME',    'proyecto_pw');
define('DB_USER',    'admin');
define('DB_PASS',    'admin');
define('DB_CHARSET', 'utf8');


// Lee JSON o POST
function getInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return $_POST;
}

// Respuesta JSON estándar
function responder(bool $ok, string $msg, array $data = []): void
{
    echo json_encode(
        ['ok' => $ok, 'msg' => $msg, 'data' => $data],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

// Conexión PDO reutilizable
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            responder(false, 'Error de conexion: ' . $e->getMessage());
        }
    }
    return $pdo;
}

// Valida token de sesión
function verificarSesion(string $token): array
{
    if (empty($token)) {
        responder(false, 'Sesion no iniciada.');
    }
    $db   = getDB();
    $stmt = $db->prepare("
        SELECT s.id_user, u.username, u.nombre, u.id_rol, u.estado, u.primer_login
        FROM   sesiones s
        INNER JOIN pw_user u ON u.id_user = s.id_user
        WHERE  s.token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    $sesion = $stmt->fetch();
    if (!$sesion)          { responder(false, 'Sesion invalida o expirada.'); }
    if (!$sesion['estado']){ responder(false, 'Usuario inactivo.'); }
    return $sesion;
}

// Módulo habilitado en menú
function moduloActivo(string $modulo): bool
{
    $db   = getDB();
    $stmt = $db->prepare("SELECT COUNT(*) AS total, COALESCE(SUM(estado = 1), 0) AS activos
                          FROM menu WHERE modulo = ? AND url IS NOT NULL");
    $stmt->execute([$modulo]);
    $r = $stmt->fetch();
    return !((int)$r['total'] > 0 && (int)$r['activos'] === 0);
}

// Rol 1 es superadmin
function rolTienePermiso(int $id_rol, string $modulo, string $accion): bool
{
    if ($id_rol === 1) { return true; }
    $db   = getDB();
    $stmt = $db->prepare("SELECT id FROM permisos_rol WHERE id_rol = ? AND modulo = ? AND accion = ?");
    $stmt->execute([$id_rol, $modulo, $accion]);
    return (bool)$stmt->fetch();
}

// Aborta si módulo deshabilitado
function verificarModuloActivo(string $modulo): void
{
    if (!moduloActivo($modulo)) {
        responder(false, 'Este modulo esta deshabilitado temporalmente.');
    }
}

// Valida módulo y permiso
function verificarPermiso(int $id_rol, string $modulo, string $accion): void
{
    verificarModuloActivo($modulo);
    if (!rolTienePermiso($id_rol, $modulo, $accion)) {
        responder(false, 'Sin permiso para esta accion.');
    }
}
