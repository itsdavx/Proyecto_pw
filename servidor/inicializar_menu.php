<?php
/**
 * inicializar_menu.php
 *
 * Script de uso único: inserta los ítems de menú base si la tabla está vacía.
 * Ejecutar UNA VEZ desde el navegador:
 *   http://localhost:8080/NRC30713-Web/Proyecto_pw/servidor/inicializar_menu.php
 * Eliminar o renombrar este archivo después.
 */
require_once __DIR__ . '/config.php';

$db = getDB();

// Si ya hay datos, no hacer nada
$stmt = $db->query("SELECT COUNT(*) as total FROM menu");
$row  = $stmt->fetch();
if ((int)$row['total'] > 0) {
    responder(true, 'El menu ya tiene datos (' . $row['total'] . ' items). No se realizo ningun cambio.');
}

$db->beginTransaction();
try {
    $insMenu = $db->prepare("
        INSERT INTO menu (id_menu, nombre, icono, url, padre_id, modulo, orden, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ");

    $items = [
        [1, 'Dashboard',      'fa-gauge',       '/NRC30713-Web/Proyecto_pw/paginas/dashboard/index.html', null,  'dashboard', 1],
        [2, 'Administración', 'fa-gear',         '#',                                                     null,  null,        2],
        [3, 'Usuarios',       'fa-users',        '/NRC30713-Web/Proyecto_pw/paginas/usuarios/index.html',  2,    'usuarios',  1],
        [4, 'Roles',          'fa-id-badge',     '/NRC30713-Web/Proyecto_pw/paginas/roles/index.html',     2,    'roles',     2],
        [5, 'Permisos',       'fa-lock',         '/NRC30713-Web/Proyecto_pw/paginas/permisos/index.html',  2,    'permisos',  3],
        [6, 'Menú',           'fa-bars',         '/NRC30713-Web/Proyecto_pw/paginas/menu/index.html',      2,    'menu',      4],
        [8, 'Mi Perfil',      'fa-circle-user',  '#',                                                     null,  'perfil',    3],
        [9, 'Cambiar Contraseña','fa-key',       '/NRC30713-Web/Proyecto_pw/paginas/perfil/frmCambiarPassword.html', 8, 'perfil', 1],
    ];

    foreach ($items as $it) {
        $insMenu->execute($it);
    }

    $db->commit();
    responder(true, 'Menu base creado correctamente. 9 items insertados. Puede eliminar este archivo.');
} catch (PDOException $e) {
    $db->rollBack();
    responder(false, 'Error al crear menu: ' . $e->getMessage());
}
