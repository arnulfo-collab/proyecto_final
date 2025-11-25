<?php
/*
 * mantenimiento_registrar.php
 * Registra un nuevo mantenimiento en un laboratorio.
 * SOLO EL ENCARGADO debe usar este archivo.
 */

header("Content-Type: application/json");
require_once "conexion.php";
session_start();

// ===============================================
// VERIFICAR ROL
// ===============================================
if (!isset($_SESSION["rol"]) || $_SESSION["rol"] !== "encargado") {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No autorizado"
    ]);
    exit;
}

// ===============================================
// RECIBIR DATOS
// ===============================================
$id_laboratorio = $_POST["id_laboratorio"] ?? "";
$descripcion = $_POST["descripcion"] ?? "";
$fecha_inicio = date("Y-m-d H:i:s");

// Validación
if (empty($id_laboratorio) || empty($descripcion)) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Todos los campos son obligatorios."
    ]);
    exit;
}

// ===============================================
// INSERTAR EN BD
// ===============================================
$sql = "INSERT INTO mantenimientos (id_laboratorio, descripcion, fecha_inicio, estado)
        VALUES (?, ?, ?, 'pendiente')";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("iss", $id_laboratorio, $descripcion, $fecha_inicio);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "ok",
        "mensaje" => "Mantenimiento registrado correctamente"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error al registrar el mantenimiento"
    ]);
}

?>
