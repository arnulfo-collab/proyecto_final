<?php
/*
 * usuarios_eliminar.php
 * Elimina un usuario del sistema.
 * SOLO ENCARGADO PUEDE ELIMINAR.
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

    $id = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : 0;

    if ($id <= 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'ID inválido']);
        exit;
    }

    // Verificar si es el único encargado
    $stmt = $db->prepare("SELECT rol FROM usuarios WHERE id_usuario = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $usuario = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$usuario) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado']);
        exit;
    }

    if ($usuario['rol'] === 'encargado') {
        $res = $db->query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'encargado'");
        $total = $res->fetch_assoc()['total'];
        if ($total <= 1) {
            ob_clean();
            echo json_encode(['ok' => false, 'error' => 'No se puede eliminar el único encargado']);
            exit;
        }
    }

    // Eliminar
    $stmt = $db->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => true, 'msg' => 'Usuario eliminado']);
    } else {
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'No se pudo eliminar']);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>
