<?php
/**
 * Registro central de Frames del sistema y sus acciones internas.
 *
 * Para agregar un Frame nuevo: registrarlo aquí (modulo, nombre y acciones)
 * y crear su ítem de menú. La matriz de permisos, la validación al guardar
 * y el menú por rol se generan automáticamente a partir de este registro.
 *
 * El acceso al Frame se controla siempre con la acción 'leer' (Habilitar).
 */
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
        ['modulo' => 'frame1', 'nombre' => 'Frame 1 — Tareas', 'acciones' => [
            ['accion' => 'crear',    'nombre' => 'Guardar tarea'],
            ['accion' => 'editar',   'nombre' => 'Editar tarea'],
            ['accion' => 'eliminar', 'nombre' => 'Eliminar tarea'],
        ]],
        ['modulo' => 'frame2', 'nombre' => 'Frame 2', 'acciones' => []],
        ['modulo' => 'frame3', 'nombre' => 'Frame 3', 'acciones' => []],
        ['modulo' => 'frame4', 'nombre' => 'Frame 4', 'acciones' => []],
        ['modulo' => 'frame5', 'nombre' => 'Frame 5', 'acciones' => []],
    ];

    // ItemMenus creados desde "Configurar Menús" no están en este catálogo
    // estático: se incorporan automáticamente como Frames de solo acceso,
    // para que puedan habilitarse por rol en el módulo Permisos.
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
    } catch (\Throwable $e) { /* getDB() no disponible en este contexto */ }

    return $frames;
}
