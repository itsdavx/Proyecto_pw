<?php
require_once dirname(__DIR__) . '/config.php';

$input  = getInput();
$token  = $input['token'] ?? '';
verificarSesion($token);

$db = getDB();

// Frase motivadora aleatoria entre las activas
try {
    $stmt = $db->query("SELECT frase, autor FROM frases WHERE estado = 1 ORDER BY RAND() LIMIT 1");
    $f = $stmt->fetch();
    responder(true, 'OK', $f ?: []);
} catch (PDOException $e) {
    responder(true, 'OK', []); // tabla aún no creada: no se muestra frase
}
