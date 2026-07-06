<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

set_error_handler(function($errno, $errstr) {
    echo json_encode(['ok' => false, 'msg' => "Error PHP [$errno]: $errstr", 'data' => []]);
    exit;
});

// ============================================================
// CONFIGURACION MySQL
// Apache: localhost:8080 | MySQL: localhost:3306
// ============================================================
define('DB_HOST',    'localhost');
define('DB_PORT',    '3306');
define('DB_NAME',    'proyecto_pw');
define('DB_USER',    'root');
define('DB_PASS',    'rootroot');
define('DB_CHARSET', 'utf8');

// ============================================================
// FUNCIONES BASE
// ============================================================

/**
 * Lee el cuerpo de la petición: JSON (enviado por fetch) o $_POST como fallback.
 */
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

function responder(bool $ok, string $msg, array $data = []): void
{
    echo json_encode(
        ['ok' => $ok, 'msg' => $msg, 'data' => $data],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

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

// Valida el token de sesion — retorna datos del usuario o detiene ejecucion
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

// Verifica que el modulo (ItemMenu) este activo globalmente — o detiene ejecucion.
// Un ItemMenu desactivado en "Configurar Menus" no es accesible para nadie.
function verificarModuloActivo(string $modulo): void
{
    $db   = getDB();
    $stmt = $db->prepare("SELECT COUNT(*) AS total, COALESCE(SUM(estado = 1), 0) AS activos
                          FROM menu WHERE modulo = ? AND url IS NOT NULL");
    $stmt->execute([$modulo]);
    $r = $stmt->fetch();
    if ((int)$r['total'] > 0 && (int)$r['activos'] === 0) {
        responder(false, 'Este modulo esta deshabilitado temporalmente.');
    }
}

// Verifica que el rol tenga permiso sobre modulo+accion — o detiene ejecucion
function verificarPermiso(int $id_rol, string $modulo, string $accion): void
{
    verificarModuloActivo($modulo);
    if ($id_rol === 1) { return; } // El Administrador siempre posee todos los permisos
    $db   = getDB();
    $stmt = $db->prepare("SELECT id FROM permisos_rol WHERE id_rol = ? AND modulo = ? AND accion = ?");
    $stmt->execute([$id_rol, $modulo, $accion]);
    if (!$stmt->fetch()) {
        responder(false, 'Sin permiso para esta accion.');
    }
}
