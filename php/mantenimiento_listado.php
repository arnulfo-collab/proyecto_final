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

require_once 'conexion.php';

try {
    $db = isset($conexion) ? $conexion : (isset($conn) ? $conn : null);
    
    if (!$db) {
        throw new Exception('Error de conexión');
    }

    $sql = "SELECT m.id_mantenimiento, m.id_laboratorio, l.nombre AS laboratorio_nombre, 
                   m.tipo, m.descripcion, 
                   DATE_FORMAT(m.fecha_inicio, '%d/%m/%Y %H:%i') AS fecha_inicio,
                   DATE_FORMAT(m.fecha_fin, '%d/%m/%Y %H:%i') AS fecha_fin,
                   m.estado, m.id_usuario_responsable
            FROM mantenimientos m
            INNER JOIN laboratorios l ON m.id_laboratorio = l.id_laboratorio
            ORDER BY m.id_mantenimiento DESC";
    
    $resultado = $db->query($sql);
    
    if (!$resultado) {
        throw new Exception('Error en consulta: ' . $db->error);
    }

    $mantenimientos = [];
    while ($fila = $resultado->fetch_assoc()) {
        $mantenimientos[] = $fila;
    }

    $resultado->free();

    // Limpiar buffer y devolver JSON
    ob_clean();
    echo json_encode($mantenimientos, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['error' => $e->getMessage()]);
}

ob_end_flush();
exit;
?>
