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

    // Por ahora obtenemos el ID del alumno desde sesión o parámetro
    $id_alumno = $_GET['id_alumno'] ?? 1; // Valor por defecto para pruebas
    $vigentes = $_GET['vigentes'] ?? 0; // Parámetro para solo mostrar vigentes
    
    // Construir WHERE según si queremos solo vigentes o historial completo
    $whereClause = "WHERE (
        (p.tipo_prestamo = 'individual' AND p.id_alumno_especifico = ?) OR
        (p.tipo_prestamo = 'grupal')
    ) AND p.estado = 'autorizado'";
    
    if ($vigentes == 1) {
        // Solo mostrar clases desde hoy en adelante
        $whereClause .= " AND DATE(p.fecha_prestamo) >= CURDATE()";
    }

    // Consulta para obtener préstamos del alumno
    $query = "
        SELECT 
            p.id_prestamo,
            p.fecha_prestamo,
            p.fecha_solicitud,
            p.estado,
            p.tipo_prestamo,
            p.nombre_grupo,
            p.descripcion_clase,
            p.numero_alumnos,
            p.motivo_individual,
            l.nombre AS nombre_laboratorio,
            l.ubicacion,
            u.nombre AS nombre_maestro
        FROM prestamos p
        INNER JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        $whereClause
        ORDER BY p.fecha_prestamo ASC
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
    $prestamos = [];

    while ($row = $result->fetch_assoc()) {
        $prestamos[] = [
            'id_prestamo' => (int)$row['id_prestamo'],
            'nombre_laboratorio' => $row['nombre_laboratorio'],
            'ubicacion' => $row['ubicacion'],
            'nombre_maestro' => $row['nombre_maestro'],
            'fecha_prestamo' => $row['fecha_prestamo'],
            'fecha_solicitud' => $row['fecha_solicitud'],
            'estado' => $row['estado'],
            'tipo_prestamo' => $row['tipo_prestamo'],
            'nombre_grupo' => $row['nombre_grupo'],
            'descripcion_clase' => $row['descripcion_clase'],
            'numero_alumnos' => $row['numero_alumnos'],
            'motivo_individual' => $row['motivo_individual']
        ];
    }

    $stmt->close();

    // Respuesta exitosa
    echo json_encode([
        'status' => 'ok',
        'prestamos' => $prestamos,
        'total' => count($prestamos),
        'alumno_id' => $id_alumno,
        'vigentes_only' => $vigentes == 1,
        'fecha_consulta' => date('Y-m-d H:i:s')
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