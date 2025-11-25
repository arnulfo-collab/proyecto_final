<?php
/*
 * usuarios_eliminar.php
 * Elimina un usuario del sistema.
 * SOLO ENCARGADO PUEDE ELIMINAR.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

error_reporting(0);
ini_set('display_errors', 0);
ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    require_once 'conexion.php';
    
    if (!isset($conexion) || $conexion->connect_error) {
        throw new Exception('Error de conexión');
    }
    
    ob_clean();
    
    $id_usuario = (int)($_POST['id_usuario'] ?? 0);
    
    if ($id_usuario <= 0) {
        throw new Exception('ID de usuario inválido');
    }
    
    // Verificar que no sea el último encargado
    $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'encargado'");
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $totalEncargados = $row['total'];
    $stmt->close();
    
    // Verificar rol del usuario a eliminar
    $stmt = $conexion->prepare("SELECT rol, nombre FROM usuarios WHERE id_usuario = ?");
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Usuario no encontrado');
    }
    
    $usuario = $result->fetch_assoc();
    $stmt->close();
    
    if ($usuario['rol'] === 'encargado' && $totalEncargados <= 1) {
        throw new Exception('No se puede eliminar al único encargado del sistema');
    }
    
    // Eliminar usuario
    $stmt = $conexion->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
    $stmt->bind_param("i", $id_usuario);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response = [
                'status' => 'ok',
                'mensaje' => "Usuario '{$usuario['nombre']}' eliminado exitosamente"
            ];
        } else {
            throw new Exception('No se pudo eliminar el usuario');
        }
    } else {
        throw new Exception('Error en la base de datos');
    }
    
    $stmt->close();
    $conexion->close();
    
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'mensaje' => $e->getMessage()
    ];
}

ob_end_clean();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
?>
