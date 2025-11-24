<?php
// Configurar headers para JSON limpio
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Deshabilitar TODOS los errores visibles
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 0);

// Capturar cualquier output no deseado
ob_start();

try {
    // Incluir conexión
    if (!file_exists('conexion.php')) {
        throw new Exception('Archivo de conexión no encontrado');
    }
    
    require_once 'conexion.php';
    
    // Verificar conexión
    if (!isset($conexion) || $conexion->connect_error) {
        throw new Exception('Error de conexión a la base de datos');
    }
    
    // Limpiar cualquier output anterior
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Obtener ID específico si se solicita
    $id_usuario = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if ($id_usuario) {
        // Obtener usuario específico
        $stmt = $conexion->prepare("SELECT id_usuario, nombre, correo, rol, DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro FROM usuarios WHERE id_usuario = ?");
        
        if (!$stmt) {
            throw new Exception('Error preparando consulta');
        }
        
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $response = [
                'status' => 'ok',
                'usuario' => [
                    'id_usuario' => (int)$row['id_usuario'],
                    'nombre' => $row['nombre'],
                    'correo' => $row['correo'],
                    'rol' => $row['rol'],
                    'fecha_registro' => $row['fecha_registro'] ?: 'Sin fecha'
                ]
            ];
        } else {
            $response = [
                'status' => 'error',
                'mensaje' => 'Usuario no encontrado'
            ];
        }
        
        $stmt->close();
        
    } else {
        // Obtener todos los usuarios
        $query = "SELECT id_usuario, nombre, correo, rol, DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro FROM usuarios ORDER BY id_usuario ASC";
        
        $result = $conexion->query($query);
        
        if (!$result) {
            throw new Exception('Error ejecutando consulta');
        }
        
        $usuarios = [];
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = [
                'id_usuario' => (int)$row['id_usuario'],
                'nombre' => $row['nombre'],
                'correo' => $row['correo'],
                'rol' => $row['rol'],
                'fecha_registro' => $row['fecha_registro'] ?: 'Sin fecha'
            ];
        }
        
        $response = [
            'status' => 'ok',
            'usuarios' => $usuarios,
            'total' => count($usuarios)
        ];
    }
    
    // Cerrar conexión
    $conexion->close();
    
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'mensaje' => $e->getMessage()
    ];
}

// Limpiar buffer y enviar respuesta JSON
ob_end_clean();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
?>
