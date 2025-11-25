<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'conexion.php';

try {
    if (!$conexion || $conexion->connect_error) {
        throw new Exception('Error de conexión');
    }

    $q = $_GET['q'] ?? '';
    if (strlen($q) < 2) {
        throw new Exception('Término de búsqueda muy corto');
    }

    // Buscar alumnos por nombre o correo
    $query = "
        SELECT id_usuario, nombre, correo 
        FROM usuarios 
        WHERE rol = 'alumno' 
        AND (nombre LIKE ? OR correo LIKE ?)
        ORDER BY nombre ASC
        LIMIT 10
    ";

    $stmt = $conexion->prepare($query);
    $searchTerm = "%$q%";
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $alumnos = [];
    while ($row = $result->fetch_assoc()) {
        $alumnos[] = [
            'id_usuario' => (int)$row['id_usuario'],
            'nombre' => $row['nombre'],
            'correo' => $row['correo']
        ];
    }

    echo json_encode([
        'status' => 'ok',
        'alumnos' => $alumnos
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'mensaje' => $e->getMessage()
    ]);
}

if (isset($conexion)) {
    $conexion->close();
}
?>