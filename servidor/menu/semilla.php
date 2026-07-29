<?php
// Menú inicial por rol
function sembrarMenuInicial(PDO $db, int $id_user, int $id_rol): void
{
    try {
        $stmt = $db->prepare("SELECT COUNT(*) FROM menu_super_usuario WHERE id_user = ?");
        $stmt->execute([$id_user]);
        if ((int)$stmt->fetchColumn() > 0) { return; }

        $stmt = $db->prepare("SELECT COUNT(*) FROM menu_orden_usuario WHERE id_user = ?");
        $stmt->execute([$id_user]);
        if ((int)$stmt->fetchColumn() > 0) { return; }

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

        // Grupos iniciales por rol
        $grupos = [
            ['nombre' => 'Mi Perfil', 'claves' => ['verperfil', 'cambiarpassword', 'menu'], 'protegido' => true],
        ];
        if ($id_rol === 1) {
            $grupos[] = ['nombre' => 'Administración', 'claves' => ['roles', 'permisos', 'usuarios', 'configmenu']];
            $grupos[] = ['nombre' => 'Módulo Facturación', 'claves' => ['frame1', 'frame2', 'frame3', 'frame4', 'frame5']];
        }

        $insSuper = $db->prepare("INSERT INTO menu_super_usuario (id_user, nombre, orden, protegido) VALUES (?, ?, ?, ?)");
        $insItem  = $db->prepare("REPLACE INTO menu_orden_usuario (id_user, id_menu, orden, id_super) VALUES (?, ?, ?, ?)");

        $asignados = [];
        $orden     = 1;

        if (isset($porClave['dashboard'])) {
            $dash = $porClave['dashboard'];
            $insItem->execute([$id_user, $dash['id_menu'], $orden++, null]);
            $asignados[$dash['id_menu']] = true;
        }

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

        foreach ($items as $it) {
            if (!isset($asignados[$it['id_menu']])) {
                $insItem->execute([$id_user, $it['id_menu'], $orden++, null]);
            }
        }
    } catch (PDOException $e) {
    }
}
