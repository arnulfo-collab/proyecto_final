<?php
// filepath: c:\xampp\htdocs\proyecto_final\php\laboratorios_api.php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

try {
    $db = isset($conexion) ? $conexion : (isset($conn) ? $conn : null);
    
    if (!$db) {
        throw new Exception('Error de conexión');
    }

    $sql = "SELECT id_laboratorio, nombre, ubicacion, capacidad, estado, fecha_creacion FROM laboratorios ORDER BY nombre ASC";
    $resultado = $db->query($sql);

    if (!$resultado) {
        throw new Exception('Error en consulta');
    }

    $laboratorios = [];
    while ($fila = $resultado->fetch_assoc()) {
        $laboratorios[] = $fila;
    }

    $resultado->free();

    ob_clean();
    echo json_encode($laboratorios, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['error' => $e->getMessage()]);
}
?>