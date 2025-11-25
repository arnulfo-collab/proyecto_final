<?php
/*
 * mantenimiento_finalizar.php
 * Marca un mantenimiento como finalizado.
 * SOLO EL ENCARGADO
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

    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

    if ($id <= 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'ID de mantenimiento inválido']);
        exit;
    }

    // Obtener el laboratorio asociado
    $stmt = $db->prepare("SELECT id_laboratorio FROM mantenimientos WHERE id_mantenimiento = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $mantenimiento = $result->fetch_assoc();
    $stmt->close();

    if (!$mantenimiento) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Mantenimiento no encontrado']);
        exit;
    }

    $id_laboratorio = $mantenimiento['id_laboratorio'];

    // Actualizar estado del mantenimiento
    $stmt = $db->prepare("UPDATE mantenimientos SET estado = 'finalizado', fecha_fin = NOW() WHERE id_mantenimiento = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $stmt->close();
        
        // Verificar si hay más mantenimientos activos para este laboratorio
        $check = $db->query("SELECT COUNT(*) as activos FROM mantenimientos WHERE id_laboratorio = $id_laboratorio AND estado = 'en_progreso'");
        $activos = $check->fetch_assoc()['activos'];
        
        // Si no hay más mantenimientos activos, poner el laboratorio como disponible
        if ($activos == 0) {
            $db->query("UPDATE laboratorios SET estado = 'disponible' WHERE id_laboratorio = $id_laboratorio");
        }
        
        ob_clean();
        echo json_encode(['ok' => true, 'msg' => 'Mantenimiento finalizado']);
    } else {
        $error = $stmt->error;
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Error: ' . $error]);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>
