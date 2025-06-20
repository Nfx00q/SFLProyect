SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `sfl_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sfl_db`;

DROP TABLE IF EXISTS `carrito`;
CREATE TABLE `carrito` (
  `id_carrito` int(11) NOT NULL,
  `fec_carrito` datetime DEFAULT NULL,
  `es_carrito` varchar(10) DEFAULT NULL,
  `usuario_id_us` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nom_categoria` varchar(100) NOT NULL,
  `des_categoria` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `categoria` (`id_categoria`, `nom_categoria`, `des_categoria`) VALUES
(1, 'Poleras', 'Poleras para toda ocasión'),
(2, 'Pantalones', 'Variedad de pantalones'),
(3, 'Chaquetas', 'Chaquetas para el invierno'),
(9, 'Zapatillas', 'Calzado urbano y deportivo');

DROP TABLE IF EXISTS `direccion`;
CREATE TABLE `direccion` (
  `id_direccion` int(11) NOT NULL,
  `usuario_id_us` int(11) NOT NULL,
  `calle` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `cod_postal` varchar(20) NOT NULL,
  `pais` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `envio`;
CREATE TABLE `envio` (
  `id_envio` int(11) NOT NULL,
  `pedido_id_pedido` int(11) NOT NULL,
  `num_segui` varchar(100) DEFAULT NULL,
  `transp` varchar(100) DEFAULT NULL,
  `est_envio` varchar(50) DEFAULT 'preparando'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `estado_usuario`;
CREATE TABLE `estado_usuario` (
  `id_est` int(11) NOT NULL,
  `nom_est` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `estado_usuario` (`id_est`, `nom_est`) VALUES
(1, 'activo'),
(2, 'inactivo'),
(3, 'suspendido');

DROP TABLE IF EXISTS `imagen_producto`;
CREATE TABLE `imagen_producto` (
  `id_img` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `url_img` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `imagen_producto` (`id_img`, `producto_id_producto`, `url_img`) VALUES
(91, 1, '001.png'),
(92, 2, '002.png'),
(93, 3, '003.png'),
(94, 4, '004.png'),
(95, 5, '005.png'),
(96, 6, '006.png'),
(97, 7, '007.png'),
(98, 8, '008.png'),
(99, 9, '009.png'),
(101, 11, '011.png'),
(102, 12, '012.png'),
(103, 13, '013.png'),
(104, 14, '014.png'),
(105, 15, '015.png'),
(106, 16, '016.png'),
(107, 17, '017.png'),
(108, 18, '018.png'),
(109, 19, '019.png'),
(110, 24, '024.png'),
(111, 25, '021.png'),
(112, 26, '022.png'),
(113, 27, '023.png'),
(114, 28, '025.png'),
(115, 29, '026.png'),
(116, 30, '027.png'),
(117, 42, '028.png'),
(118, 43, '029.png'),
(119, 44, '031.png'),
(120, 45, '034.png');

DROP TABLE IF EXISTS `pago`;
CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `pedido_id_pedido` int(11) NOT NULL,
  `meto_pago` varchar(50) NOT NULL,
  `est_pago` varchar(50) DEFAULT 'pendiente',
  `monto_pago` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `pedido`;
CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `usuario_id_us` int(11) NOT NULL,
  `est_pedido` varchar(50) DEFAULT 'pendiente',
  `total_pedido` decimal(10,2) NOT NULL,
  `hora_fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nom_producto` varchar(255) NOT NULL,
  `des_producto` text DEFAULT NULL,
  `precio_producto` decimal(10,2) NOT NULL,
  `categoria_id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `producto` (`id_producto`, `nom_producto`, `des_producto`, `precio_producto`, `categoria_id_categoria`) VALUES
(1, 'Polera Minimall 1', 'Diseño minimalista en algodón', 11990.00, 1),
(2, 'Polera Minimal 2', 'Diseño minimalista en algodón', 11990.00, 1),
(3, 'Polera Art 1', 'Diseño artístico exclusivo', 13990.00, 1),
(4, 'Polera Art 2', 'Diseño artístico exclusivo', 13990.00, 1),
(5, 'Polera Blackout', 'Polera negra oversize', 10990.00, 1),
(6, 'Polera Blanca', 'Básica blanca unisex', 8990.00, 1),
(7, 'Polera Urbana', 'Estilo urbano impreso', 12990.00, 1),
(8, 'Polera Oldschool', 'Diseño retro', 12990.00, 1),
(9, 'Polera Estampada', 'Estampado original', 13990.00, 1),
(11, 'Buzo boogy', 'Estilo 8ball', 19990.00, 2),
(12, 'Buzo boogy', 'Estilo calabera', 17990.00, 2),
(13, 'Buzo boogy', 'Estilo happy face', 20990.00, 2),
(14, 'Buzo boogy', 'Estilo artistico', 18990.00, 2),
(15, 'Buzo boogy', 'Estilo tiger', 17990.00, 2),
(16, 'Buzo boogy', 'Estilo butterfly', 19990.00, 2),
(17, 'Buzo boogy', 'Estilo wings', 18990.00, 2),
(18, 'Buzo boogy', 'Estilo hawk', 18990.00, 2),
(19, 'Buzo boogy', 'Estilo rose', 20990.00, 2),
(24, 'Chaqueta winter', 'Estilo blackout', 30000.00, 3),
(25, 'Chaqueta winter', 'Estilo brown', 28000.00, 3),
(26, 'Chaqueta winter', 'Estilo darkblue', 32000.00, 3),
(27, 'Chaqueta winter', 'Estilo cappuccino', 31000.00, 3),
(28, 'Chaqueta winter', 'Estilo marca original / Brown', 27000.00, 3),
(29, 'Chaqueta winter', 'Estilo darkgreen', 45000.00, 3),
(30, 'Chaqueta winter', 'Estilo light cream', 40000.00, 3),
(42, 'Zapatillas runner', 'Estilo runner black', 55000.00, 9),
(43, 'Zapatillas training', 'Calzado deportivo', 62000.00, 9),
(44, 'Zapatillas runner', 'Estilo black and red', 59000.00, 9),
(45, 'Zapatillas tracking', 'Estilo terreno / Black', 65000.00, 9);

DROP TABLE IF EXISTS `producto_carrito`;
CREATE TABLE `producto_carrito` (
  `id` int(11) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `cantidad` int(11) DEFAULT 1,
  `carrito_id_carrito` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `variante_producto_id_var` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `producto_pedido`;
CREATE TABLE `producto_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id_pedido` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `reg_usuario`;
CREATE TABLE `reg_usuario` (
  `id_reg` int(11) NOT NULL,
  `usuario_id_us` int(11) DEFAULT NULL,
  `acc_reg` varchar(255) DEFAULT NULL,
  `fec_reg` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nom_rol` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `rol` (`id_rol`, `nom_rol`) VALUES
(1, 'admin'),
(2, 'cliente'),
(3, 'vendedor');

DROP TABLE IF EXISTS `talla`;
CREATE TABLE `talla` (
  `id_talla` int(11) NOT NULL,
  `nom_talla` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `talla` (`id_talla`, `nom_talla`) VALUES
(1, 'XS'),
(2, 'S'),
(3, 'M'),
(4, 'L'),
(5, 'XL'),
(6, 'XXL');

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_us` int(11) NOT NULL,
  `nom_us` varchar(100) NOT NULL,
  `mail_us` varchar(100) NOT NULL,
  `pass_us` varchar(255) NOT NULL,
  `rol_id_rol` int(11) NOT NULL,
  `id_est` int(11) NOT NULL DEFAULT 1,
  `tel_us` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT DELAYED IGNORE INTO `usuario` (`id_us`, `nom_us`, `mail_us`, `pass_us`, `rol_id_rol`, `id_est`, `tel_us`) VALUES
(1, 'Benjamin Belmar', 'babgutierrez.135@gmail.com', '$2b$10$pt8upPi8wdJ7ebK84Ia4v.DPNLs4Ks4nI1wqAnZLuqqaIrXoHLfnG', 2, 1, 922208860),
(2, 'Denisse Orellana', 'denisse@moderator.com', '$2b$10$qF6y.0GYK7Gr0gMKE0wtD.si6ZP4gp3FnvvlPIP//InVz3VS.6V2.', 1, 1, NULL),
(4, 'Jack Sparrow', 'jacksparrow@gmail.com', '$2b$10$XV2B9w9JEuhr3ZhPvEbVr.8iBwBpmuB.rMKfJkZaHS6n8bWGp9nkG', 3, 1, NULL);

DROP TABLE IF EXISTS `variante_producto`;
CREATE TABLE `variante_producto` (
  `id_var` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `talla_id_talla` int(11) NOT NULL,
  `stock_var` int(11) NOT NULL,
  `precio_var` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_carrito`),
  ADD KEY `usuario_id_us` (`usuario_id_us`);

ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

ALTER TABLE `direccion`
  ADD PRIMARY KEY (`id_direccion`),
  ADD KEY `usuario_id_us` (`usuario_id_us`);

ALTER TABLE `estado_usuario`
  ADD PRIMARY KEY (`id_est`);

ALTER TABLE `imagen_producto`
  ADD PRIMARY KEY (`id_img`);

ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `usuario_id_us` (`usuario_id_us`);

ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `categoria_id_categoria` (`categoria_id_categoria`);

ALTER TABLE `producto_carrito`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_us`),
  ADD UNIQUE KEY `mail_us` (`mail_us`),
  ADD KEY `rol_id_rol` (`rol_id_rol`),
  ADD KEY `fk_estado_usuario` (`id_est`);

ALTER TABLE `variante_producto`
  ADD PRIMARY KEY (`id_var`);


ALTER TABLE `carrito`
  MODIFY `id_carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

ALTER TABLE `direccion`
  MODIFY `id_direccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `imagen_producto`
  MODIFY `id_img` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

ALTER TABLE `producto_carrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `usuario`
  MODIFY `id_us` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `variante_producto`
  MODIFY `id_var` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id_us`) REFERENCES `usuario` (`id_us`);

ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`usuario_id_us`) REFERENCES `usuario` (`id_us`);

ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`categoria_id_categoria`) REFERENCES `categoria` (`id_categoria`);

ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_estado_usuario` FOREIGN KEY (`id_est`) REFERENCES `estado_usuario` (`id_est`),
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`rol_id_rol`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
