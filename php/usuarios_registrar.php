<?php
/*
 * usuarios_registrar.php
 * Registra un nuevo usuario del sistema.
 * SOLO EL ENCARGADO PUEDE CREAR USUARIOS.
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
    
    // Obtener y validar datos
    $nombre = trim($_POST['nombre'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $rol = trim($_POST['rol'] ?? '');
    $password = $_POST['password'] ?? '123456';
    
    if (empty($nombre)) {
        throw new Exception('El nombre es requerido');
    }
    
    if (empty($correo)) {
        throw new Exception('El correo es requerido');
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
    
    // Verificar si el correo ya existe
    $stmt = $conexion->prepare("SELECT id_usuario FROM usuarios WHERE correo = ?");
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception('Ya existe un usuario con este correo');
    }
    $stmt->close();
    
    // Insertar nuevo usuario
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conexion->prepare("INSERT INTO usuarios (nombre, correo, password, rol, fecha_registro) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssss", $nombre, $correo, $password_hash, $rol);
    
    if ($stmt->execute()) {
        $response = [
            'status' => 'ok',
            'mensaje' => 'Usuario creado exitosamente',
            'id_usuario' => $conexion->insert_id
        ];
    } else {
        throw new Exception('Error al crear usuario');
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

