-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-06-2025 a las 03:32:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sfl_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id_carrito` int(11) NOT NULL,
  `fec_carrito` datetime DEFAULT NULL,
  `es_carrito` varchar(10) DEFAULT NULL,
  `usuario_id_us` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nom_categoria` varchar(100) NOT NULL,
  `des_categoria` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nom_categoria`, `des_categoria`) VALUES
(1, 'Poleras', 'Poleras para toda ocasión'),
(2, 'Pantalones', 'Variedad de pantalones'),
(3, 'Chaquetas', 'Chaquetas para el invierno'),
(4, 'Accesorios', 'Gorros, bufandas y más'),
(9, 'Zapatillas', 'Calzado urbano y deportivo'),
(11, 'Oversize', 'Estilo holgado y moderno'),
(12, 'Ropa Formal', 'Camisas, blazers y más para ocasiones elegantes'),
(14, 'Sudaderas', 'Comodidad para el día a día');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direccion`
--

CREATE TABLE `direccion` (
  `id_direccion` int(11) NOT NULL,
  `usuario_id_us` int(11) NOT NULL,
  `calle` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `cod_postal` varchar(20) NOT NULL,
  `pais` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `envio`
--

CREATE TABLE `envio` (
  `id_envio` int(11) NOT NULL,
  `pedido_id_pedido` int(11) NOT NULL,
  `num_segui` varchar(100) DEFAULT NULL,
  `transp` varchar(100) DEFAULT NULL,
  `est_envio` varchar(50) DEFAULT 'preparando'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_usuario`
--

CREATE TABLE `estado_usuario` (
  `id_est` int(11) NOT NULL,
  `nom_est` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagen_producto`
--

CREATE TABLE `imagen_producto` (
  `id_img` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `url_img` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagen_producto`
--

INSERT INTO `imagen_producto` (`id_img`, `producto_id_producto`, `url_img`) VALUES
(54, 1, '001.png'),
(55, 2, '002.png'),
(56, 3, '003.png'),
(57, 4, '004.png'),
(58, 5, '006.png'),
(59, 6, '007.png'),
(60, 7, '009.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `pedido_id_pedido` int(11) NOT NULL,
  `meto_pago` varchar(50) NOT NULL,
  `est_pago` varchar(50) DEFAULT 'pendiente',
  `monto_pago` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `usuario_id_us` int(11) NOT NULL,
  `est_pedido` varchar(50) DEFAULT 'pendiente',
  `total_pedido` decimal(10,2) NOT NULL,
  `hora_fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nom_producto` varchar(255) NOT NULL,
  `des_producto` text DEFAULT NULL,
  `precio_producto` decimal(10,2) NOT NULL,
  `categoria_id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nom_producto`, `des_producto`, `precio_producto`, `categoria_id_categoria`) VALUES
(1, 'Polera Minimall 1', 'Diseño minimalista en algodón', 11990.00, 1),
(2, 'Polera Minimal 2', 'Diseño minimalista en algodón', 11990.00, 1),
(3, 'Polera Art 1', 'Diseño artístico exclusivo', 13990.00, 1),
(4, 'Polera Art 2', 'Diseño artístico exclusivo', 13990.00, 1),
(5, 'Polera Blackout', 'Polera negra oversize', 10990.00, 1),
(6, 'Polera Blanca', 'Básica blanca unisex', 8990.00, 1),
(7, 'Polera Urbana', 'Estilo urbano impreso', 12990.00, 1),
(8, 'Polera Oldschool', 'Diseño retro', 12990.00, 1),
(9, 'Polera Estampada', 'Estampado original', 13990.00, 1),
(10, 'Polera Skull', 'Con calavera vintage', 13990.00, 1),
(11, 'Jeans Skinny', 'Jeans ajustado', 19990.00, 2),
(12, 'Jogger Negro', 'Cómodo y moderno', 17990.00, 2),
(13, 'Pantalón Cargo Verde', 'Táctico y urbano', 20990.00, 2),
(14, 'Pantalón Recto', 'Estilo clásico', 18990.00, 2),
(15, 'Jeans Azul', 'Línea casual', 17990.00, 2),
(16, 'Pantalón Roto', 'Estilo destroyer', 19990.00, 2),
(17, 'Jogger Urbano', 'Diseño streetwear', 18990.00, 2),
(18, 'Pantalón Beige', 'Estilo neutro', 18990.00, 2),
(19, 'Pantalón Oversize', 'Amplio y cómodo', 20990.00, 2),
(41, 'Polera Básica Blanca', 'Poleras para toda ocasión', 15000.00, 1),
(43, 'Polera Manga Larga', 'Poleras para toda ocasión', 20000.00, 1),
(44, 'Polera Deportiva', 'Poleras para toda ocasión', 22000.00, 1),
(45, 'Polera Oversize', 'Poleras para toda ocasión', 25000.00, 1),
(46, 'Pantalón Jeans Azul', 'Variedad de pantalones', 30000.00, 2),
(47, 'Pantalón de Tela', 'Variedad de pantalones', 28000.00, 2),
(48, 'Pantalón Cargo', 'Variedad de pantalones', 32000.00, 2),
(49, 'Pantalón Chino', 'Variedad de pantalones', 31000.00, 2),
(50, 'Pantalón Deportivo', 'Variedad de pantalones', 27000.00, 2),
(51, 'Chaqueta de Invierno Negra', 'Chaquetas para el invierno', 45000.00, 3),
(52, 'Chaqueta Rompeviento', 'Chaquetas para el invierno', 40000.00, 3),
(53, 'Chaqueta con Capucha', 'Chaquetas para el invierno', 42000.00, 3),
(54, 'Chaqueta de Cuero', 'Chaquetas para el invierno', 55000.00, 3),
(55, 'Chaqueta Acolchada', 'Chaquetas para el invierno', 48000.00, 3),
(56, 'Gorro de Lana', 'Gorros, bufandas y más', 8000.00, 4),
(57, 'Bufanda de Algodón', 'Gorros, bufandas y más', 9000.00, 4),
(58, 'Guantes Térmicos', 'Gorros, bufandas y más', 7000.00, 4),
(59, 'Cinturón de Cuero', 'Gorros, bufandas y más', 15000.00, 4),
(60, 'Sombrero Panamá', 'Gorros, bufandas y más', 12000.00, 4),
(66, 'Zapatillas Urbanas Negras', 'Calzado urbano y deportivo', 60000.00, 9),
(67, 'Zapatillas Running', 'Calzado urbano y deportivo', 65000.00, 9),
(68, 'Zapatillas Basket', 'Calzado urbano y deportivo', 70000.00, 9),
(69, 'Zapatillas Casual', 'Calzado urbano y deportivo', 55000.00, 9),
(70, 'Zapatillas de Entrenamiento', 'Calzado urbano y deportivo', 62000.00, 9),
(71, 'Polera Oversize Blanca', 'Estilo holgado y moderno', 18000.00, 11),
(72, 'Sudadera Oversize', 'Estilo holgado y moderno', 25000.00, 11),
(73, 'Chaqueta Oversize', 'Estilo holgado y moderno', 40000.00, 11),
(75, 'Camiseta Oversize Estampada', 'Estilo holgado y moderno', 20000.00, 11),
(76, 'Camisa Formal Blanca', 'Camisas, blazers y más para ocasiones elegantes', 35000.00, 12),
(77, 'Blazer Azul Marino', 'Camisas, blazers y más para ocasiones elegantes', 55000.00, 12),
(78, 'Pantalón Formal Negro', 'Camisas, blazers y más para ocasiones elegantes', 40000.00, 12),
(79, 'Vestido Formal', 'Camisas, blazers y más para ocasiones elegantes', 60000.00, 12),
(80, 'Corbata Clásica', 'Camisas, blazers y más para ocasiones elegantes', 10000.00, 12),
(81, 'Sudadera Básica', 'Comodidad para el día a día', 22000.00, 14),
(82, 'Sudadera con Capucha', 'Comodidad para el día a día', 26000.00, 14),
(83, 'Sudadera Deportiva', 'Comodidad para el día a día', 28000.00, 14),
(85, 'Sudadera con Diseño', 'Comodidad para el día a día', 25000.00, 14);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_carrito`
--

CREATE TABLE `producto_carrito` (
  `id` int(11) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `cantidad` int(11) DEFAULT 1,
  `carrito_id_carrito` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_pedido`
--

CREATE TABLE `producto_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id_pedido` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reg_usuario`
--

CREATE TABLE `reg_usuario` (
  `id_reg` int(11) NOT NULL,
  `usuario_id_us` int(11) DEFAULT NULL,
  `acc_reg` varchar(255) DEFAULT NULL,
  `fec_reg` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenia_producto`
--

CREATE TABLE `resenia_producto` (
  `id_resenia` int(11) NOT NULL,
  `usuario_id_us` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `calidad_prod` int(11) DEFAULT NULL CHECK (`calidad_prod` between 1 and 5),
  `creatividad_prod` int(11) DEFAULT NULL CHECK (`creatividad_prod` between 1 and 5),
  `estilo_prod` int(11) DEFAULT NULL CHECK (`estilo_prod` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `fecha_resenia` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nom_rol` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nom_rol`) VALUES
(1, 'admin'),
(2, 'cliente'),
(3, 'vendedor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talla`
--

CREATE TABLE `talla` (
  `id_talla` int(11) NOT NULL,
  `nom_talla` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_us` int(11) NOT NULL,
  `nom_us` varchar(100) NOT NULL,
  `mail_us` varchar(100) NOT NULL,
  `pass_us` varchar(255) NOT NULL,
  `rol_id_rol` int(11) NOT NULL,
  `id_est` int(11) NOT NULL DEFAULT 1,
  `tel_us` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variante_producto`
--

CREATE TABLE `variante_producto` (
  `id_var` int(11) NOT NULL,
  `producto_id_producto` int(11) NOT NULL,
  `talla_id_talla` int(11) NOT NULL,
  `stock_var` int(11) NOT NULL,
  `precio_var` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_carrito`),
  ADD KEY `usuario_id_us` (`usuario_id_us`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD PRIMARY KEY (`id_direccion`),
  ADD KEY `usuario_id_us` (`usuario_id_us`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `direccion`
--
ALTER TABLE `direccion`
  MODIFY `id_direccion` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
