<?php
// Catálogo de módulos
function obtenerRegistroFrames(): array
{
    $frames = [
        ['modulo' => 'dashboard', 'nombre' => 'Dashboard', 'acciones' => []],
        ['modulo' => 'usuarios',  'nombre' => 'Usuarios',  'acciones' => [
            ['accion' => 'crear',       'nombre' => 'Agregar usuario'],
            ['accion' => 'editar',      'nombre' => 'Editar usuario'],
            ['accion' => 'desactivar',  'nombre' => 'Activar / desactivar usuario'],
            ['accion' => 'cambiar_rol', 'nombre' => 'Cambiar rol'],
        ]],
        ['modulo' => 'roles', 'nombre' => 'Roles', 'acciones' => [
            ['accion' => 'crear',    'nombre' => 'Crear rol'],
            ['accion' => 'editar',   'nombre' => 'Editar rol'],
            ['accion' => 'eliminar', 'nombre' => 'Eliminar rol'],
        ]],
        ['modulo' => 'permisos', 'nombre' => 'Permisos', 'acciones' => [
            ['accion' => 'crear', 'nombre' => 'Modificar permisos'],
        ]],
        ['modulo' => 'menu', 'nombre' => 'Menú (personalización propia)', 'acciones' => [
            ['accion' => 'crear',      'nombre' => 'Crear SuperMenu'],
            ['accion' => 'renombrar',  'nombre' => 'Renombrar SuperMenu'],
            ['accion' => 'eliminar',   'nombre' => 'Eliminar SuperMenu'],
            ['accion' => 'reordenar',  'nombre' => 'Reordenar menú'],
        ]],
        ['modulo' => 'configmenu', 'nombre' => 'Configurar Menús', 'acciones' => [
            ['accion' => 'crear',    'nombre' => 'Crear ItemMenu'],
            ['accion' => 'editar',   'nombre' => 'Editar ItemMenu'],
            ['accion' => 'eliminar', 'nombre' => 'Eliminar ItemMenu'],
            ['accion' => 'estado',   'nombre' => 'Activar / desactivar ItemMenu'],
        ]],
        ['modulo' => 'perfil', 'nombre' => 'Mi Perfil', 'acciones' => [
            ['accion' => 'editar', 'nombre' => 'Cambiar contraseña'],
        ]],
        ['modulo' => 'frame1', 'nombre' => 'Movimientos', 'acciones' => []],
        ['modulo' => 'frame2', 'nombre' => 'Facturación Electrónica', 'acciones' => [
            ['accion' => 'crear',  'nombre' => 'Generar factura'],
            ['accion' => 'editar', 'nombre' => 'Editar datos del emisor'],
        ]],
        ['modulo' => 'frame3', 'nombre' => 'Inventario', 'acciones' => [
            ['accion' => 'crear',    'nombre' => 'Crear producto'],
            ['accion' => 'editar',   'nombre' => 'Editar producto'],
            ['accion' => 'estado',   'nombre' => 'Activar / desactivar producto'],
            ['accion' => 'eliminar', 'nombre' => 'Eliminar producto'],
        ]],
        ['modulo' => 'frame4', 'nombre' => 'Clientes', 'acciones' => [
            ['accion' => 'crear',    'nombre' => 'Crear cliente'],
            ['accion' => 'editar',   'nombre' => 'Editar cliente'],
            ['accion' => 'estado',   'nombre' => 'Activar / desactivar cliente'],
            ['accion' => 'eliminar', 'nombre' => 'Eliminar cliente'],
        ]],
        ['modulo' => 'frame5', 'nombre' => 'Frame 5', 'acciones' => []],
    ];

    try {
        $db       = getDB();
        $conocidos = array_column($frames, 'modulo');
        $ph        = implode(',', array_fill(0, count($conocidos), '?'));
        $stmt      = $db->prepare("
            SELECT DISTINCT modulo, nombre FROM menu
            WHERE  url IS NOT NULL AND modulo NOT IN ($ph)
            ORDER  BY id_menu ASC
        ");
        $stmt->execute($conocidos);
        foreach ($stmt->fetchAll() as $fila) {
            $frames[] = ['modulo' => $fila['modulo'], 'nombre' => $fila['nombre'], 'acciones' => []];
        }
    } catch (\Throwable $e) {  }

    return $frames;
}
