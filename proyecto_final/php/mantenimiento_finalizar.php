<?php
/*
 * mantenimiento_finalizar.php
 * Marca un mantenimiento como finalizado.
 * SOLO EL ENCARGADO
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

    $id_mantenimiento = $_POST["id_mantenimiento"] ?? "";

    if (empty($id_mantenimiento)) {
        throw new Exception("ID de mantenimiento requerido");
    }

    $conexion = new mysqli('localhost:3307', 'root', '', 'sistema_laboratorios');
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión");
    }
    
    $conexion->set_charset("utf8mb4");
    $conexion->begin_transaction();

    // Obtener el laboratorio del mantenimiento
    $sql_get = "SELECT id_laboratorio FROM mantenimientos WHERE id_mantenimiento = ?";
    $stmt_get = $conexion->prepare($sql_get);
    $stmt_get->bind_param("i", $id_mantenimiento);
    $stmt_get->execute();
    $resultado = $stmt_get->get_result();

    if ($resultado->num_rows === 0) {
        throw new Exception("Mantenimiento no encontrado");
    }

    $row = $resultado->fetch_assoc();
    $id_laboratorio = $row["id_laboratorio"];

    // Actualizar estado del mantenimiento
    $sql_update = "UPDATE mantenimientos SET estado = 'finalizado' WHERE id_mantenimiento = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("i", $id_mantenimiento);
    
    if (!$stmt_update->execute()) {
        throw new Exception("Error al finalizar mantenimiento");
    }

    // Cambiar laboratorio de vuelta a disponible
    $sql_lab = "UPDATE laboratorios SET estado = 'disponible' WHERE id_laboratorio = ?";
    $stmt_lab = $conexion->prepare($sql_lab);
    $stmt_lab->bind_param("i", $id_laboratorio);
    
    if (!$stmt_lab->execute()) {
        throw new Exception("Error al actualizar laboratorio");
    }

    $conexion->commit();
    $conexion->close();

    ob_clean();
    echo json_encode([
        "status" => "ok",
        "mensaje" => "Mantenimiento finalizado correctamente"
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
