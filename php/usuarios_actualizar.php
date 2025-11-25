<?php
/*
 * usuarios_actualizar.php
 * Actualiza los datos de un usuario.
 * SOLO EL ENCARGADO PUEDE MODIFICAR.
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
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
    $rol = isset($_POST['rol']) ? trim($_POST['rol']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    if ($id <= 0 || empty($nombre) || empty($correo) || empty($rol)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Faltan datos requeridos']);
        exit;
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Correo inválido']);
        exit;
    }

    if (!in_array($rol, ['alumno', 'maestro', 'encargado'])) {
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'Rol inválido']);
        exit;
    }

    // Verificar correo duplicado
    $stmt = $db->prepare("SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?");
    $stmt->bind_param("si", $correo, $id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => false, 'error' => 'El correo ya está en uso']);
        exit;
    }
    $stmt->close();

    // Actualizar - COLUMNA CORRECTA: contrasena
    if (!empty($password)) {
        if (strlen($password) < 6) {
            ob_clean();
            echo json_encode(['ok' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres']);
            exit;
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE usuarios SET nombre=?, correo=?, contrasena=?, rol=? WHERE id_usuario=?");
        $stmt->bind_param("ssssi", $nombre, $correo, $hash, $rol, $id);
    } else {
        $stmt = $db->prepare("UPDATE usuarios SET nombre=?, correo=?, rol=? WHERE id_usuario=?");
        $stmt->bind_param("sssi", $nombre, $correo, $rol, $id);
    }

    if ($stmt->execute()) {
        $stmt->close();
        ob_clean();
        echo json_encode(['ok' => true, 'msg' => 'Usuario actualizado']);
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
