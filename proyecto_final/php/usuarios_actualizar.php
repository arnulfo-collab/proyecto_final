<?php
/*
 * usuarios_actualizar.php
 * Actualiza los datos de un usuario.
 * SOLO EL ENCARGADO PUEDE MODIFICAR.
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
    
    // Obtener datos
    $id_usuario = (int)($_POST['id_usuario'] ?? 0);
    $nombre = trim($_POST['nombre'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $rol = trim($_POST['rol'] ?? '');
    
    if ($id_usuario <= 0) {
        throw new Exception('ID de usuario inválido');
    }
    
    if (empty($nombre) || empty($correo) || empty($rol)) {
        throw new Exception('Todos los campos son requeridos');
    }
    
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Formato de correo inválido');
    }
    
    if (!preg_match('/@uabc\.edu\.mx$/', $correo)) {
        throw new Exception('El correo debe ser institucional (@uabc.edu.mx)');
    }
    
    if (!in_array($rol, ['alumno', 'maestro', 'encargado'])) {
        throw new Exception('Rol inválido');
    }
    
    // Verificar que el correo no esté en uso por otro usuario
    $stmt = $conexion->prepare("SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?");
    $stmt->bind_param("si", $correo, $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception('Ya existe otro usuario con este correo');
    }
    $stmt->close();
    
    // Actualizar usuario
    $stmt = $conexion->prepare("UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id_usuario = ?");
    $stmt->bind_param("sssi", $nombre, $correo, $rol, $id_usuario);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response = [
                'status' => 'ok',
                'mensaje' => 'Usuario actualizado exitosamente'
            ];
        } else {
            $response = [
                'status' => 'ok',
                'mensaje' => 'No se realizaron cambios (datos idénticos)'
            ];
        }
    } else {
        throw new Exception('Error al actualizar usuario');
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
