-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 25-11-2025 a las 09:51:02
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
-- Base de datos: `sistema_laboratorios`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `laboratorios`
--

CREATE TABLE `laboratorios` (
  `id_laboratorio` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ubicacion` varchar(150) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `estado` enum('disponible','ocupado','mantenimiento') DEFAULT 'disponible',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `laboratorios`
--

INSERT INTO `laboratorios` (`id_laboratorio`, `nombre`, `ubicacion`, `capacidad`, `estado`, `fecha_creacion`) VALUES
(1, 'Laboratorio de Computación 1', 'Edificio A - Segundo Piso', 30, 'disponible', '2025-11-18 04:51:25'),
(2, 'Laboratorio de Química', 'Edificio B - Primer Piso', 25, 'disponible', '2025-11-18 04:51:25'),
(3, 'Laboratorio de Física', 'Edificio C - Segunda Planta', 20, 'disponible', '2025-11-18 04:51:25'),
(4, 'Laboratorio de Biología', 'Edificio B - Planta Baja', 28, 'disponible', '2025-11-18 04:51:25'),
(18, 'Laboratorio 20', 'Edificio E- Planta Baja', 25, 'mantenimiento', '2025-11-25 06:41:06'),
(22, 'Laboratorio 21', 'Edificio E- Planta Baja', 25, 'disponible', '2025-11-25 07:54:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimientos`
--

CREATE TABLE `mantenimientos` (
  `id_mantenimiento` int(11) NOT NULL,
  `id_laboratorio` int(11) NOT NULL,
  `tipo` enum('preventivo','correctivo','limpieza','actualizacion') NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `estado` enum('en_progreso','finalizado','cancelado') DEFAULT 'en_progreso',
  `id_usuario_responsable` int(11) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mantenimientos`
--

INSERT INTO `mantenimientos` (`id_mantenimiento`, `id_laboratorio`, `tipo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `estado`, `id_usuario_responsable`, `fecha_registro`) VALUES
(1, 4, 'preventivo', 'LIMPIEZA GENERAL DE COMPUTADORAS DEL LABORATORIO', '2025-11-19 22:24:00', '2025-11-21 22:24:00', 'finalizado', 1, '2025-11-18 06:24:28'),
(2, 4, 'preventivo', 'ACTUALIZACION DE SOFTWARE', '2025-11-25 22:16:00', '2025-11-25 00:08:58', 'finalizado', 1, '2025-11-24 06:17:30'),
(3, 1, 'preventivo', 'mantenimiento', '2025-11-26 19:54:00', '2025-11-25 00:08:55', 'finalizado', 1, '2025-11-25 03:54:17'),
(4, 1, 'preventivo', 'mantenimiento', '2025-11-26 19:54:00', '2025-11-25 00:08:51', 'finalizado', 1, '2025-11-25 03:54:23'),
(5, 4, 'preventivo', 'a', '2025-11-27 20:03:00', '2025-11-28 20:03:00', 'finalizado', 1, '2025-11-25 04:03:17'),
(6, 4, 'correctivo', 'cambiar monitor', '2025-11-25 10:35:00', '2025-11-25 12:35:00', 'finalizado', 1, '2025-11-25 05:34:57'),
(7, 18, 'preventivo', 'pc', '2025-11-26 08:00:00', '2025-11-25 00:42:42', 'finalizado', 1, '2025-11-25 08:09:14'),
(8, 18, 'preventivo', 'pc', '2025-11-26 08:00:00', '2025-11-28 18:00:00', 'en_progreso', 1, '2025-11-25 08:09:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `id_prestamo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_laboratorio` int(11) NOT NULL,
  `fecha_prestamo` datetime NOT NULL,
  `fecha_devolucion` datetime DEFAULT NULL,
  `estado` enum('pendiente','autorizado','rechazado','en_uso','finalizado') DEFAULT 'pendiente',
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_prestamo` enum('individual','grupal') DEFAULT 'grupal',
  `nombre_grupo` varchar(100) DEFAULT NULL,
  `descripcion_clase` varchar(255) DEFAULT NULL,
  `numero_alumnos` int(11) DEFAULT NULL,
  `id_alumno_especifico` int(11) DEFAULT NULL,
  `motivo_individual` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestamos`
--

INSERT INTO `prestamos` (`id_prestamo`, `id_usuario`, `id_laboratorio`, `fecha_prestamo`, `fecha_devolucion`, `estado`, `fecha_solicitud`, `tipo_prestamo`, `nombre_grupo`, `descripcion_clase`, `numero_alumnos`, `id_alumno_especifico`, `motivo_individual`) VALUES
(1, 2, 1, '2025-11-18 07:31:00', NULL, 'autorizado', '2025-11-18 05:29:06', 'grupal', NULL, NULL, NULL, NULL, NULL),
(2, 2, 1, '2025-11-28 08:00:00', NULL, 'rechazado', '2025-11-24 05:30:26', 'grupal', NULL, NULL, 0, NULL, NULL),
(3, 2, 1, '2025-11-28 08:00:00', NULL, 'rechazado', '2025-11-24 05:30:35', 'grupal', NULL, NULL, 0, NULL, NULL),
(5, 1, 4, '2025-11-23 21:36:00', NULL, 'rechazado', '2025-11-24 05:36:49', 'grupal', '221', 'clase de programacion ', 7, NULL, NULL),
(6, 1, 4, '2025-11-06 21:52:00', NULL, 'rechazado', '2025-11-24 05:52:19', 'grupal', '221', 'clase de programacion', 7, NULL, NULL),
(7, 2, 4, '2025-11-21 21:55:00', NULL, 'rechazado', '2025-11-24 05:55:17', 'grupal', NULL, NULL, NULL, NULL, NULL),
(8, 2, 1, '2025-11-27 20:00:00', NULL, 'autorizado', '2025-11-25 03:51:02', 'grupal', NULL, NULL, NULL, NULL, NULL),
(11, 2, 3, '2025-11-27 21:07:00', NULL, 'rechazado', '2025-11-25 05:07:05', 'grupal', NULL, NULL, NULL, NULL, NULL),
(12, 2, 22, '2025-11-25 23:58:00', NULL, 'autorizado', '2025-11-25 07:58:35', 'grupal', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('alumno','maestro','encargado') NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contrasena`, `rol`, `fecha_registro`) VALUES
(1, 'Encargado Principal', 'encargado@uabc.edu.mx', '123456', 'encargado', '2025-11-18 04:51:25'),
(2, 'Juan Pérez', 'juan.perez@uabc.edu.mx', '123456', 'maestro', '2025-11-18 04:51:25'),
(3, 'María García', 'maria.garcia@uabc.edu.mx', '123456', 'alumno', '2025-11-18 04:51:25'),
(4, 'Carlos López', 'carlos.lopez@uabc.edu.mx', '123456', 'maestro', '2025-11-18 04:51:25'),
(5, 'Ana Rodríguez', 'ana.rodriguez@uabc.edu.mx', '123456', 'alumno', '2025-11-18 04:51:25'),
(6, 'Admin Encargado', 'admin@uabc.edu.mx', '123456', 'encargado', '2025-11-18 05:37:57');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  ADD PRIMARY KEY (`id_laboratorio`);

--
-- Indices de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD PRIMARY KEY (`id_mantenimiento`),
  ADD KEY `id_laboratorio` (`id_laboratorio`),
  ADD KEY `id_usuario_responsable` (`id_usuario_responsable`);

--
-- Indices de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id_prestamo`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_laboratorio` (`id_laboratorio`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  MODIFY `id_laboratorio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  MODIFY `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  MODIFY `id_prestamo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorios` (`id_laboratorio`),
  ADD CONSTRAINT `mantenimientos_ibfk_2` FOREIGN KEY (`id_usuario_responsable`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorios` (`id_laboratorio`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
