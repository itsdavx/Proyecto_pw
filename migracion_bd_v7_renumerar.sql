-- ============================================================
-- MIGRACIÓN v7 — Renumeración de identificadores (1, 2, 3, ...)
-- Ejecutar UNA SOLA VEZ en phpMyAdmin, DESPUÉS de migracion_bd_v6.sql.
-- Recomendado: hacer respaldo antes y ejecutar sin usuarios conectados.
-- Las FKs con ON UPDATE CASCADE propagan los nuevos IDs a las tablas hijas.
-- ============================================================

-- ── 1) Unificar FKs con ON UPDATE CASCADE (mejora permanente de consistencia) ──
ALTER TABLE `menu_orden_usuario`
  DROP FOREIGN KEY `fk_mou_menu`,
  DROP FOREIGN KEY `fk_mou_user`,
  DROP FOREIGN KEY `fk_mou_super`;
ALTER TABLE `menu_orden_usuario`
  ADD CONSTRAINT `fk_mou_menu`  FOREIGN KEY (`id_menu`)  REFERENCES `menu` (`id_menu`)                ON DELETE CASCADE  ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mou_user`  FOREIGN KEY (`id_user`)  REFERENCES `pw_user` (`id_user`)            ON DELETE CASCADE  ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mou_super` FOREIGN KEY (`id_super`) REFERENCES `menu_super_usuario` (`id_super`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `accesos_ocultos_usuario`
  DROP FOREIGN KEY `fk_aou_menu`,
  DROP FOREIGN KEY `fk_aou_user`;
ALTER TABLE `accesos_ocultos_usuario`
  ADD CONSTRAINT `fk_aou_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`)     ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aou_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `menu_super_usuario`
  DROP FOREIGN KEY `fk_msu_user`;
ALTER TABLE `menu_super_usuario`
  ADD CONSTRAINT `fk_msu_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tareas`
  DROP FOREIGN KEY `fk_tarea_user`;
ALTER TABLE `tareas`
  ADD CONSTRAINT `fk_tarea_user` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pw_user`
  DROP FOREIGN KEY `fk_user_creator`;
ALTER TABLE `pw_user`
  ADD CONSTRAINT `fk_user_creator` FOREIGN KEY (`created_by`) REFERENCES `pw_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ── 2) Renumerar `menu` (tras la v6 quedan: 1,3,4,5,6,9,13,14,15,16,17,18,21) ──
-- En orden ascendente cada destino queda libre antes de usarse.
UPDATE `menu` SET `id_menu` = 2  WHERE `id_menu` = 3;
UPDATE `menu` SET `id_menu` = 3  WHERE `id_menu` = 4;
UPDATE `menu` SET `id_menu` = 4  WHERE `id_menu` = 5;
UPDATE `menu` SET `id_menu` = 5  WHERE `id_menu` = 6;
UPDATE `menu` SET `id_menu` = 6  WHERE `id_menu` = 9;
UPDATE `menu` SET `id_menu` = 7  WHERE `id_menu` = 13;
UPDATE `menu` SET `id_menu` = 8  WHERE `id_menu` = 14;
UPDATE `menu` SET `id_menu` = 9  WHERE `id_menu` = 15;
UPDATE `menu` SET `id_menu` = 10 WHERE `id_menu` = 16;
UPDATE `menu` SET `id_menu` = 11 WHERE `id_menu` = 17;
UPDATE `menu` SET `id_menu` = 12 WHERE `id_menu` = 18;
UPDATE `menu` SET `id_menu` = 13 WHERE `id_menu` = 21;

-- ── 3) Renumerar `pw_user` (1, 5 → 1, 2) ──
UPDATE `pw_user` SET `id_user` = 2 WHERE `id_user` = 5;

-- ── 4) Renumerar `menu_super_usuario` (1, 2, 3, 5 → 1, 2, 3, 4) ──
UPDATE `menu_super_usuario` SET `id_super` = 4 WHERE `id_super` = 5;

-- ── 5) Renumerar `permisos_rol` (84 filas, sin tablas hijas) ──
SET @n := 0;
UPDATE `permisos_rol` SET `id` = (@n := @n + 1) ORDER BY `id`;

-- ── 6) Reiniciar contadores AUTO_INCREMENT (InnoDB los ajusta a MAX+1) ──
ALTER TABLE `menu`              AUTO_INCREMENT = 1;
ALTER TABLE `pw_user`           AUTO_INCREMENT = 1;
ALTER TABLE `menu_super_usuario` AUTO_INCREMENT = 1;
ALTER TABLE `permisos_rol`      AUTO_INCREMENT = 1;
ALTER TABLE `login_intentos`    AUTO_INCREMENT = 1;
ALTER TABLE `tareas`            AUTO_INCREMENT = 1;
ALTER TABLE `frases`            AUTO_INCREMENT = 1;
