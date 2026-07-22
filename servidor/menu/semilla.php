<?php
/**
 * Semilla del menú personal inicial.
 *
 * Se ejecuta UNA sola vez, al crear el usuario. Genera:
 *   - Dashboard como ItemMenu independiente de nivel raíz (nunca agrupado).
 *   - SuperMenu "Mi Perfil": Ver Perfil, Cambiar Contraseña, Menú.
 *   - Solo Administrador: SuperMenu "Administración" (Roles, Permisos,
 *     Usuarios, Configurar Menús) y SuperMenu "Módulo Facturación" (Frame1..Frame5).
 *   - El resto de ItemMenu habilitados para el rol, sin agrupar.
 *
 * Si el usuario ya tiene organización personal, no hace nada: las
 * personalizaciones nunca se sobrescriben.
 */
function sembrarMenuInicial(PDO $db, int $id_user, int $id_rol): void
{
    try {
        // No duplicar: solo si el usuario aún no tiene organización personal
        $stmt = $db->prepare("SELECT COUNT(*) FROM menu_super_usuario WHERE id_user = ?");
        $stmt->execute([$id_user]);
        if ((int)$stmt->fetchColumn() > 0) { return; }

        $stmt = $db->prepare("SELECT COUNT(*) FROM menu_orden_usuario WHERE id_user = ?");
        $stmt->execute([$id_user]);
        if ((int)$stmt->fetchColumn() > 0) { return; }

        // ItemMenus activos habilitados para el rol (RBAC)
        if ($id_rol === 1) {
            $stmt = $db->prepare("SELECT id_menu, modulo, url, orden FROM menu WHERE estado = 1 AND url IS NOT NULL ORDER BY orden ASC");
            $stmt->execute();
        } else {
            $stmt = $db->prepare("SELECT modulo FROM permisos_rol WHERE id_rol = ? AND accion = 'leer'");
            $stmt->execute([$id_rol]);
            $modulos = array_column($stmt->fetchAll(), 'modulo');
            if (empty($modulos)) { return; }

            $ph   = implode(',', array_fill(0, count($modulos), '?'));
            $stmt = $db->prepare("SELECT id_menu, modulo, url, orden FROM menu WHERE estado = 1 AND url IS NOT NULL AND modulo IN ($ph) ORDER BY orden ASC");
            $stmt->execute($modulos);
        }
        $items = $stmt->fetchAll();
        if (empty($items)) { return; }

        // Clave de identificación (los dos ítems de perfil comparten módulo)
        $clave = function (array $it): string {
            if ($it['modulo'] === 'perfil') {
                return (stripos((string)$it['url'], 'frmVerPerfil') !== false) ? 'verperfil' : 'cambiarpassword';
            }
            return (string)$it['modulo'];
        };

        $porClave = [];
        foreach ($items as $it) {
            $porClave[$clave($it)] = $it;
        }

        // SuperMenus iniciales y su contenido, en orden.
        // "Mi Perfil" es obligatorio: se marca protegido para que el
        // usuario nunca pueda eliminarlo (si puede reorganizarlo y
        // moverle o quitarle ItemMenu libremente).
        $grupos = [
            ['nombre' => 'Mi Perfil', 'claves' => ['verperfil', 'cambiarpassword', 'menu'], 'protegido' => true],
        ];
        if ($id_rol === 1) {
            $grupos[] = ['nombre' => 'Administración', 'claves' => ['roles', 'permisos', 'usuarios', 'configmenu']];
            $grupos[] = ['nombre' => 'Módulo Facturación', 'claves' => ['frame1', 'frame2', 'frame3', 'frame4', 'frame5']];
        }

        $insSuper = $db->prepare("INSERT INTO menu_super_usuario (id_user, nombre, orden, protegido) VALUES (?, ?, ?, ?)");
        $insItem  = $db->prepare("REPLACE INTO menu_orden_usuario (id_user, id_menu, orden, id_super) VALUES (?, ?, ?, ?)");

        /* La raíz usa una secuencia de orden única donde ItemMenus y
           SuperMenus se intercalan libremente. Orden inicial obligatorio:
           Dashboard → Mi Perfil (y demás SuperMenus) → resto sin agrupar. */
        $asignados = [];
        $orden     = 1;

        // 1) Dashboard siempre primero, nivel raíz
        if (isset($porClave['dashboard'])) {
            $dash = $porClave['dashboard'];
            $insItem->execute([$id_user, $dash['id_menu'], $orden++, null]);
            $asignados[$dash['id_menu']] = true;
        }

        // 2) SuperMenus iniciales, justo debajo del Dashboard
        foreach ($grupos as $g) {
            $presentes = array_values(array_filter($g['claves'], function ($c) use ($porClave) {
                return isset($porClave[$c]);
            }));
            if (empty($presentes)) { continue; }

            $insSuper->execute([$id_user, $g['nombre'], $orden++, !empty($g['protegido']) ? 1 : 0]);
            $idSuper = (int)$db->lastInsertId();

            $ordenItem = 1;
            foreach ($presentes as $c) {
                $it = $porClave[$c];
                $insItem->execute([$id_user, $it['id_menu'], $ordenItem++, $idSuper]);
                $asignados[$it['id_menu']] = true;
            }
        }

        // 3) Resto de ItemMenu habilitados, sin agrupar
        foreach ($items as $it) {
            if (!isset($asignados[$it['id_menu']])) {
                $insItem->execute([$id_user, $it['id_menu'], $orden++, null]);
            }
        }
    } catch (PDOException $e) {
        /* La semilla del menú no debe impedir la creación del usuario;
           sin organización inicial, el menú se muestra plano. */
    }
}
