<?php
// ===========================================
// prestamos.php
// Maneja 3 cosas:
// 1. Registrar un préstamo (método POST)
// 2. Obtener préstamos de un usuario (GET con id_usuario)
// 3. Encargado actualiza estado: aprobar/rechazar (POST con accion)
// ===========================================

header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

if (!isLoggedIn()) {
    echo json_encode(["status" => "error", "mensaje" => "No autorizado"]);
    exit;
}

// ===========================================
// CASO 1: Obtener préstamos de un usuario
// GET -> prestamos.php?id_usuario=1
// ===========================================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $id_usuario = $_GET["id_usuario"] ?? $_SESSION["id_usuario"];
    
    try {
        $sql = "
        SELECT 
            p.id_prestamo,
            p.fecha_prestamo,
            p.estado,
            p.fecha_solicitud,
            l.nombre AS laboratorio
        FROM prestamos p
        JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
        WHERE p.id_usuario = ?
        ORDER BY p.id_prestamo DESC
        ";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $prestamos = [];
        while ($row = $resultado->fetch_assoc()) {
            $prestamos[] = $row;
        }
        
        echo json_encode($prestamos);
        
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "mensaje" => "Error al obtener préstamos"]);
    }
}

// ===========================================
// CASO 2: Registrar un préstamo
// POST -> sin "accion"
// ===========================================
else if ($_SERVER["REQUEST_METHOD"] === "POST" && !isset($_POST["accion"])) {
    $id_usuario = $_POST["id_usuario"] ?? $_SESSION["id_usuario"];
    $id_laboratorio = $_POST["id_laboratorio"] ?? "";
    $fecha_prestamo = $_POST["fecha_prestamo"] ?? "";

    if (!$id_laboratorio || !$fecha_prestamo) {
        echo json_encode(["status" => "error", "mensaje" => "Complete todos los campos"]);
        exit;
    }

    try {
        $sql = "INSERT INTO prestamos (id_usuario, id_laboratorio, fecha_prestamo, estado, fecha_solicitud) VALUES (?, ?, ?, 'pendiente', NOW())";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("iis", $id_usuario, $id_laboratorio, $fecha_prestamo);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "ok", "mensaje" => "Préstamo solicitado exitosamente"]);
        } else {
            echo json_encode(["status" => "error", "mensaje" => "Error al solicitar préstamo"]);
        }
        
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "mensaje" => "Error del servidor"]);
    }
}

// ===========================================
// CASO 3: Actualizar estado (APROBAR / RECHAZAR)
// POST -> accion = aprobar / rechazar
// ===========================================
else if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["accion"])) {
    if ($_SESSION["rol"] !== "encargado") {
        echo json_encode(["status" => "error", "mensaje" => "No autorizado"]);
        exit;
    }
    
    $accion = $_POST["accion"];
    $id_prestamo = $_POST["id_prestamo"];
    
    $nuevo_estado = ($accion === "aprobar") ? "autorizado" : "rechazado";
    
    try {
        $sql = "UPDATE prestamos SET estado = ? WHERE id_prestamo = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("si", $nuevo_estado, $id_prestamo);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "ok", "mensaje" => "Préstamo " . ($accion === "aprobar" ? "aprobado" : "rechazado")]);
        } else {
            echo json_encode(["status" => "error", "mensaje" => "Error al actualizar"]);
        }
        
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "mensaje" => "Error del servidor"]);
    }
}
?>
