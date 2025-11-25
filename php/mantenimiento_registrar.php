<?php
/*
 * mantenimiento_registrar.php
 * Registra un nuevo mantenimiento en un laboratorio.
 * SOLO EL ENCARGADO debe usar este archivo.
 */

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

    $id_laboratorio = isset($_POST['laboratorio']) ? intval($_POST['laboratorio']) : 0;
    $tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';
    $descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
    $fecha_inicio = isset($_POST['fecha_inicio']) ? $_POST['fecha_inicio'] : '';
    $fecha_fin = isset($_POST['fecha_fin_estimada']) ? $_POST['fecha_fin_estimada'] : '';

    // Validaciones
    if ($id_laboratorio <= 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Selecciona un laboratorio']);
        exit;
    }

    if (empty($tipo)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Selecciona el tipo de mantenimiento']);
        exit;
    }

    if (empty($descripcion)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Ingresa una descripción']);
        exit;
    }

    if (empty($fecha_inicio)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Selecciona la fecha de inicio']);
        exit;
    }

    // Si no hay fecha fin, usar la misma fecha de inicio + 1 día
    if (empty($fecha_fin)) {
        $fecha_fin = date('Y-m-d', strtotime($fecha_inicio . ' +1 day'));
    }

    // Formatear fechas
    $fecha_inicio_dt = $fecha_inicio . ' 08:00:00';
    $fecha_fin_dt = $fecha_fin . ' 18:00:00';

    // ID del usuario responsable (desde sesión o por defecto 1)
    session_start();
    $id_usuario = isset($_SESSION['id_usuario']) ? $_SESSION['id_usuario'] : 1;

    // Insertar mantenimiento
    $stmt = $db->prepare("INSERT INTO mantenimientos (id_laboratorio, tipo, descripcion, fecha_inicio, fecha_fin, estado, id_usuario_responsable) VALUES (?, ?, ?, ?, ?, 'en_progreso', ?)");
    $stmt->bind_param("issssi", $id_laboratorio, $tipo, $descripcion, $fecha_inicio_dt, $fecha_fin_dt, $id_usuario);

    if ($stmt->execute()) {
        $id = $db->insert_id;
        
        // Actualizar estado del laboratorio a mantenimiento
        $db->query("UPDATE laboratorios SET estado = 'mantenimiento' WHERE id_laboratorio = $id_laboratorio");
        
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => true, 'msg' => 'Mantenimiento registrado exitosamente', 'id' => $id]);
    } else {
        $error = $stmt->error;
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Error al registrar: ' . $error]);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>
