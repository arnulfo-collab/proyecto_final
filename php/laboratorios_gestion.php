<?php
// Limpiar buffer y evitar salida HTML
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

require_once 'conexion.php';

// Limpiar cualquier salida previa
ob_end_clean();

// SOLO devolver JSON
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // GET: Listar laboratorios
    if ($method === 'GET') {
        $sql = "SELECT * FROM laboratorios ORDER BY id_laboratorio ASC";
        $result = $conexion->query($sql);
        
        if ($result === false) {
            throw new Exception('Error en consulta: ' . $conexion->error);
        }
        
        $laboratorios = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($laboratorios);
        exit;
    }
    
    // POST: Crear o actualizar (acepta con o sin parámetro ajax)
    if ($method === 'POST') {
        $id = isset($_POST['id_laboratorio']) ? intval($_POST['id_laboratorio']) : 0;
        $nombre = trim($_POST['nombre'] ?? '');
        $ubicacion = trim($_POST['ubicacion'] ?? '');
        $capacidad = intval($_POST['capacidad'] ?? 0);
        $estado = trim($_POST['estado'] ?? 'disponible');

        if (empty($nombre) || empty($ubicacion) || $capacidad <= 0) {
            echo json_encode(['ok' => false, 'error' => 'Datos incompletos']);
            exit;
        }

        if ($id > 0) {
            // Actualizar
            $sql = "UPDATE laboratorios SET nombre=?, ubicacion=?, capacidad=?, estado=? WHERE id_laboratorio=?";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param('ssisi', $nombre, $ubicacion, $capacidad, $estado, $id);
        } else {
            // Crear
            $sql = "INSERT INTO laboratorios (nombre, ubicacion, capacidad, estado) VALUES (?, ?, ?, ?)";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param('ssis', $nombre, $ubicacion, $capacidad, $estado);
        }

        if ($stmt->execute()) {
            echo json_encode(['ok' => true, 'msg' => 'Laboratorio guardado correctamente']);
        } else {
            echo json_encode(['ok' => false, 'error' => 'Error al guardar: ' . $stmt->error]);
        }
        $stmt->close();
        exit;
    }
    
    // DELETE: Eliminar
    if ($method === 'DELETE') {
        parse_str(file_get_contents('php://input'), $_DELETE);
        $id = intval($_DELETE['id_laboratorio'] ?? 0);

        if ($id <= 0) {
            echo json_encode(['status' => 'error', 'mensaje' => 'ID inválido']);
            exit;
        }

        $sql = "DELETE FROM laboratorios WHERE id_laboratorio = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'ok', 'mensaje' => 'Laboratorio eliminado']);
        } else {
            echo json_encode(['status' => 'error', 'mensaje' => 'Error al eliminar: ' . $stmt->error]);
        }
        $stmt->close();
        exit;
    }
    
    // Si llega aquí, método no soportado
    echo json_encode(['ok' => false, 'error' => 'Método HTTP no soportado: ' . $method]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>