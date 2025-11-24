<?php
// filepath: c:\xampp\htdocs\proyecto_final\php\laboratorios.php

// Deshabilitar errores para JSON limpio
error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=utf-8");

// Buffer para capturar cualquier output no deseado
ob_start();

try {
    session_start();
    
    // Verificar sesión
    if (!isset($_SESSION["id_usuario"]) || !isset($_SESSION["rol"])) {
        throw new Exception("No autorizado - sesión inválida");
    }
    
    // Conexión directa
    $conexion = new mysqli('localhost:3307', 'root', '', 'sistema_laboratorios');
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }
    
    $conexion->set_charset("utf8mb4");
    
    // Determinar qué laboratorios mostrar
    $para_mantenimiento = isset($_GET["para_mantenimiento"]) && $_SESSION["rol"] === "encargado";
    
    if ($para_mantenimiento) {
        // Para mantenimiento: TODOS los laboratorios (disponibles, mantenimiento, etc.)
        $sql = "SELECT id_laboratorio, nombre, ubicacion, capacidad, estado FROM laboratorios ORDER BY nombre";
        $filtro = "TODOS";
    } else {
        // Para préstamos: solo disponibles
        $sql = "SELECT id_laboratorio, nombre, ubicacion, capacidad, estado FROM laboratorios WHERE estado = 'disponible' ORDER BY nombre";
        $filtro = "DISPONIBLES";
    }
    
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        throw new Exception("Error en consulta SQL: " . $conexion->error);
    }
    
    $laboratorios = [];
    while ($row = $resultado->fetch_assoc()) {
        $laboratorios[] = [
            'id_laboratorio' => (int)$row['id_laboratorio'],
            'nombre' => $row['nombre'],
            'ubicacion' => $row['ubicacion'],
            'capacidad' => (int)$row['capacidad'],
            'estado' => $row['estado']
        ];
    }
    
    $conexion->close();
    
    // Log para debugging (opcional)
    error_log("LABORATORIOS: Filtro=$filtro, Total=" . count($laboratorios) . ", Usuario=" . $_SESSION["rol"]);
    
    // Limpiar buffer y enviar JSON
    ob_clean();
    echo json_encode($laboratorios, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Limpiar buffer y enviar error
    ob_clean();
    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

ob_end_flush();
exit;
?>
