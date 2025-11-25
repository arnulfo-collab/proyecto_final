<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'conexion.php';

try {
    // Verificar conexión
    if (!$conexion || $conexion->connect_error) {
        throw new Exception('Error de conexión: ' . ($conexion->connect_error ?? 'Conexión no establecida'));
    }

    // Por ahora obtenemos el ID del alumno desde parámetro
    $id_alumno = $_GET['id_alumno'] ?? 1; // Valor por defecto para pruebas

    // Consulta para obtener todo el historial del alumno
    $query = "
        SELECT 
            p.id_prestamo,
            p.fecha_prestamo,
            p.fecha_solicitud,
            p.estado,
            l.nombre AS nombre_laboratorio,
            l.ubicacion,
            u.nombre AS nombre_maestro
        FROM prestamos p
        INNER JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_alumno = ?
        ORDER BY p.fecha_solicitud DESC
    ";

    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        throw new Exception('Error preparando consulta: ' . $conexion->error);
    }

    $stmt->bind_param("i", $id_alumno);
    $resultado = $stmt->execute();

    if (!$resultado) {
        throw new Exception('Error ejecutando consulta: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    $historial = [];

    while ($row = $result->fetch_assoc()) {
        $historial[] = [
            'id_prestamo' => (int)$row['id_prestamo'],
            'nombre_laboratorio' => $row['nombre_laboratorio'],
            'ubicacion' => $row['ubicacion'],
            'nombre_maestro' => $row['nombre_maestro'],
            'fecha_prestamo' => $row['fecha_prestamo'],
            'fecha_solicitud' => $row['fecha_solicitud'],
            'estado' => $row['estado']
        ];
    }

    $stmt->close();

    // Respuesta exitosa
    echo json_encode([
        'status' => 'ok',
        'historial' => $historial,
        'total' => count($historial),
        'alumno_id' => $id_alumno
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'mensaje' => 'Error del servidor: ' . $e->getMessage(),
        'debug' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>