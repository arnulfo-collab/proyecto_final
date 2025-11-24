<?php
// ===========================================
// prestamos_encargado.php
// Devuelve TODOS los préstamos registrados,
// junto con el nombre del laboratorio y del usuario.
// SOLO EL ENCARGADO puede acceder.
// ===========================================

// IMPORTANTE: Primero configurar headers
header("Content-Type: application/json; charset=utf-8");

// Solo en desarrollo - remover en producción
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Iniciar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Incluir conexión
require_once "conexion.php";

try {
    // Verificar sesión
    if (!isset($_SESSION["rol"])) {
        throw new Exception("No hay sesión activa. Por favor inicia sesión.");
    }

    if ($_SESSION["rol"] !== "encargado") {
        throw new Exception("Acceso denegado: requiere rol encargado. Tu rol actual es: " . $_SESSION["rol"]);
    }

    // Consulta para obtener préstamos
    $sql = "
    SELECT 
        p.id_prestamo,
        p.fecha_prestamo,
        p.estado,
        p.fecha_solicitud,
        u.nombre AS usuario,
        u.correo,
        l.nombre AS laboratorio
    FROM prestamos p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
    ORDER BY p.id_prestamo DESC
    ";

    $resultado = $conexion->query($sql);

    if (!$resultado) {
        throw new Exception("Error en consulta: " . $conexion->error);
    }

    $prestamos = [];
    while ($row = $resultado->fetch_assoc()) {
        $prestamos[] = $row;
    }

    // Devolver los préstamos como JSON
    echo json_encode($prestamos, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

exit;
?>
