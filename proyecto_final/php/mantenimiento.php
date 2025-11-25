<?php
/*
 * mantenimiento.php
 * Control de mantenimientos de laboratorios.
 * Funciones:
 * 1. Registrar mantenimiento (POST)
 * 2. Mostrar todos los mantenimientos (GET)
 * 3. Mostrar mantenimientos por laboratorio (GET con id_laboratorio)
 */

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=utf-8");

ob_start();

try {
    session_start();
    
    if (!isset($_SESSION["id_usuario"]) || $_SESSION["rol"] !== "encargado") {
        throw new Exception("No autorizado");
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Método no permitido");
    }

    $conexion = new mysqli('localhost:3307', 'root', '', 'sistema_laboratorios');
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión");
    }
    
    $conexion->set_charset("utf8mb4");

    $id_laboratorio = $_POST["id_laboratorio"] ?? "";
    $tipo = $_POST["tipo"] ?? "";
    $descripcion = $_POST["descripcion"] ?? "";
    $fecha_inicio = $_POST["fecha_inicio"] ?? "";
    $fecha_fin = $_POST["fecha_fin"] ?? "";

    if (empty($id_laboratorio) || empty($tipo) || empty($descripcion) || empty($fecha_inicio) || empty($fecha_fin)) {
        throw new Exception("Complete todos los campos");
    }

    $conexion->begin_transaction();

    // Insertar mantenimiento
    $sql = "INSERT INTO mantenimientos (id_laboratorio, tipo, descripcion, fecha_inicio, fecha_fin, estado, id_usuario_responsable, fecha_registro) VALUES (?, ?, ?, ?, ?, 'en_progreso', ?, NOW())";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("issssi", $id_laboratorio, $tipo, $descripcion, $fecha_inicio, $fecha_fin, $_SESSION["id_usuario"]);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al registrar mantenimiento");
    }

    // Actualizar estado del laboratorio
    $sql_update = "UPDATE laboratorios SET estado = 'mantenimiento' WHERE id_laboratorio = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("i", $id_laboratorio);
    
    if (!$stmt_update->execute()) {
        throw new Exception("Error al actualizar laboratorio");
    }

    $conexion->commit();
    $conexion->close();

    ob_clean();
    echo json_encode([
        "status" => "ok",
        "mensaje" => "Mantenimiento registrado correctamente"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($conexion)) {
        $conexion->rollback();
        $conexion->close();
    }
    
    ob_clean();
    echo json_encode([
        "status" => "error",
        "mensaje" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

ob_end_flush();
exit;
?>
