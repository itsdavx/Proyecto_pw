<?php
// Frase aleatoria activa
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
verificarSesion($token);

$db = getDB();

try {
    $stmt = $db->query("SELECT frase, autor FROM frases WHERE estado = 1 ORDER BY RAND() LIMIT 1");
    $f = $stmt->fetch();
    responder(true, 'OK', $f ?: []);
} catch (PDOException $e) {
    responder(true, 'OK', []);
}
