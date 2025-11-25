<?php
/*
 * mantenimiento_listado.php
 * Devuelve todos los mantenimientos
 * SOLO EL ENCARGADO
 */

// Deshabilitar errores de PHP
error_reporting(0);
ini_set('display_errors', 0);

// Configurar headers
header("Content-Type: application/json; charset=utf-8");

// Buffer de salida
ob_start();

try {
    session_start();
    
    // Verificar sesión
    if (!isset($_SESSION["id_usuario"]) || $_SESSION["rol"] !== "encargado") {
        throw new Exception("No autorizado");
    }
    
    // Conexión directa
    $conexion = new mysqli('localhost:3307', 'root', '', 'sistema_laboratorios');
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión");
    }
    
    $conexion->set_charset("utf8mb4");
    
    // Consultar mantenimientos con LEFT JOIN por si no hay usuarios
    $sql = "
    SELECT 
        m.id_mantenimiento,
        m.tipo,
        m.descripcion,
        m.fecha_inicio,
        m.fecha_fin,
        m.estado,
        m.fecha_registro,
        l.nombre AS laboratorio,
        COALESCE(u.nombre, 'Usuario no encontrado') AS responsable
    FROM mantenimientos m
    JOIN laboratorios l ON m.id_laboratorio = l.id_laboratorio
    LEFT JOIN usuarios u ON m.id_usuario_responsable = u.id_usuario
    ORDER BY m.fecha_registro DESC
    ";

    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        throw new Exception("Error en consulta: " . $conexion->error);
    }
    
    $mantenimientos = [];
    while ($row = $resultado->fetch_assoc()) {
        $mantenimientos[] = $row;
    }
    
    $conexion->close();
    
    // Limpiar buffer y devolver JSON
    ob_clean();
    echo json_encode($mantenimientos, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

ob_end_flush();
exit;
?>
