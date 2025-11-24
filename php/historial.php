<?php
/*
 * historial.php
 * Devuelve historial de préstamos y mantenimientos.
 *
 * FUNCIONES:
 * 1. Si recibe id_usuario -> historial del usuario
 * 2. Si NO recibe id_usuario -> historial completo (solo encargado)
 */

header("Content-Type: application/json; charset=utf-8");

session_start();

if (!isset($_SESSION["id_usuario"])) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No hay sesión activa"
    ]);
    exit;
}

$id_usuario = $_GET["id_usuario"] ?? $_SESSION["id_usuario"];

if (!$id_usuario || !is_numeric($id_usuario)) {
    echo json_encode([
        "status" => "error", 
        "mensaje" => "ID de usuario inválido"
    ]);
    exit;
}

try {
    require_once "conexion.php";

    $sql = "
    SELECT 
        p.id_prestamo,
        p.fecha_prestamo,
        p.estado,
        l.nombre AS laboratorio,
        p.fecha_solicitud
    FROM prestamos p
    INNER JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
    WHERE p.id_usuario = ?
    ORDER BY p.fecha_solicitud DESC
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $historial = $resultado->fetch_all(MYSQLI_ASSOC);
    
    echo json_encode($historial, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error al obtener historial: " . $e->getMessage()
    ]);
}

exit;
?>
