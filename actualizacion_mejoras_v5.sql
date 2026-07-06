-- ============================================================
-- SCRIPT INCREMENTAL v5 — Accesos rápidos por usuario + frases
-- Ejecutar UNA SOLA VEZ en phpMyAdmin sobre la BD `proyecto_pw`.
-- ============================================================

-- Motivo: cada usuario decide qué Accesos Rápidos ver en su Dashboard
-- (se guardan los OCULTOS; sin filas = se muestran todos los permitidos).
CREATE TABLE IF NOT EXISTS `accesos_ocultos_usuario` (
  `id_user` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  PRIMARY KEY (`id_user`, `id_menu`),
  KEY `fk_aou_menu` (`id_menu`),
  CONSTRAINT `fk_aou_user` FOREIGN KEY (`id_user`) REFERENCES `pw_user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `fk_aou_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Motivo: frases motivadoras del Dashboard (solo usuarios no administradores);
-- las frases viven en la BD, no en el código fuente.
CREATE TABLE IF NOT EXISTS `frases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `frase` varchar(500) NOT NULL,
  `autor` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `frases` (`frase`, `autor`, `estado`) VALUES
('La disciplina supera al talento cuando el talento no es disciplinado.', 'Anónimo', 1),
('El éxito es la suma de pequeños esfuerzos repetidos día tras día.', 'Robert Collier', 1),
('No cuentes los días, haz que los días cuenten.', 'Muhammad Ali', 1),
('La mejor manera de predecir el futuro es crearlo.', 'Peter Drucker', 1),
('El único modo de hacer un gran trabajo es amar lo que haces.', 'Steve Jobs', 1),
('No importa lo lento que vayas mientras no te detengas.', 'Confucio', 1),
('Cree que puedes y ya estarás a medio camino.', 'Theodore Roosevelt', 1),
('La constancia es el camino más corto hacia el logro.', 'Anónimo', 1);
