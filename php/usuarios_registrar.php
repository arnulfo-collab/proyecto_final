<?php
/*
 * usuarios_registrar.php
 * Registra un nuevo usuario del sistema.
 * SOLO EL ENCARGADO PUEDE CREAR USUARIOS.
 */

ob_start();
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

try {
    // Usar $conexion o $conn
    $db = isset($conexion) ? $conexion : (isset($conn) ? $conn : null);
    
    if (!$db) {
        throw new Exception('Error de conexión a la base de datos');
    }

    // Obtener datos
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $rol = isset($_POST['rol']) ? trim($_POST['rol']) : '';

    // Validaciones
    if (empty($nombre)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'El nombre es requerido']);
        exit;
    }

    if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Correo electrónico inválido']);
        exit;
    }

    if (empty($password)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'La contraseña es requerida']);
        exit;
    }

    if (strlen($password) < 6) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres']);
        exit;
    }

    if (!in_array($rol, ['alumno', 'maestro', 'encargado'])) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Rol inválido']);
        exit;
    }

    // Verificar correo duplicado
    $stmt = $db->prepare("SELECT id_usuario FROM usuarios WHERE correo = ?");
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'El correo electrónico ya está registrado']);
        exit;
    }
    $stmt->close();

    // Hash de contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar - COLUMNA CORRECTA: contrasena
    $stmt = $db->prepare("INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $nombre, $correo, $password_hash, $rol);

    if ($stmt->execute()) {
        $id = $db->insert_id;
        $stmt->close();
        
        ob_clean();
        echo json_encode(['ok' => true, 'msg' => 'Usuario registrado exitosamente', 'id_usuario' => $id]);
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

