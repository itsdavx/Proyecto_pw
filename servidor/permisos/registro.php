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
    return [
        ['modulo' => 'dashboard', 'nombre' => 'Dashboard', 'acciones' => []],
        ['modulo' => 'usuarios',  'nombre' => 'Usuarios',  'acciones' => [
            ['accion' => 'crear',    'nombre' => 'Agregar usuario'],
            ['accion' => 'editar',   'nombre' => 'Editar usuario / desactivar / cambiar rol'],
        ]],
        ['modulo' => 'roles', 'nombre' => 'Roles', 'acciones' => [
            ['accion' => 'crear',  'nombre' => 'Crear rol'],
            ['accion' => 'editar', 'nombre' => 'Editar rol'],
        ]],
        ['modulo' => 'permisos', 'nombre' => 'Permisos', 'acciones' => [
            ['accion' => 'crear', 'nombre' => 'Guardar permisos'],
        ]],
        ['modulo' => 'menu', 'nombre' => 'Menú (personalización propia)', 'acciones' => []],
        ['modulo' => 'configmenu', 'nombre' => 'Configurar Menús', 'acciones' => [
            ['accion' => 'editar', 'nombre' => 'Activar / desactivar ItemMenu'],
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
}
