<?php
// filepath: c:\xampp\htdocs\proyecto_final\php\conexion.php

// Habilitar mostrar errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_PORT', 3307);
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sistema_laboratorios');

try {
    // CORRECCIÓN: Conectar usando puerto en host
    $conexion = new mysqli(DB_HOST . ":" . DB_PORT, DB_USER, DB_PASS, DB_NAME);
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }
    
    $conexion->set_charset("utf8mb4");
    
} catch (Exception $e) {
    die("Error de conexión: " . $e->getMessage());
}

// Función para verificar si el usuario está logueado
function isLoggedIn() {
    return isset($_SESSION['id_usuario']) && isset($_SESSION['rol']);
}

// Función para requerir login
function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: ../index.html");
        exit;
    }
}
?>
